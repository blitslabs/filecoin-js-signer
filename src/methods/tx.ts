import { keyPairFromPrivateKey } from "@nodefactory/filecoin-address";
import { Wallet } from "./wallet";
import { LotusClient } from "filecoin.js";
import secp256k1 from "secp256k1";
import lowercaseKeys from "lowercase-keys";
import cbor from "ipld-dag-cbor";
import BN from "bn.js";
import { tryToPrivateKeyBuffer, getDigest, bytesToAddress, addressAsBytes, serializeBigNum } from "./utils";
import {
    Message,
    PrivateKey,
    Network,
    ProtocolIndicator,
    Address,
    TokenAmount,
    CID,
    SignedMessage,
    FilecoinNetwork,
} from "../core/types/types";
import BigNumber from "bignumber.js";
import { publicKeyToAddress } from "@nodefactory/filecoin-address";

export class Tx {
    constructor(private readonly lotus: LotusClient) {
    }

    /**
     * @notice Send a custom Message
     * @param message Custom unsigned Message
     * @param privateKey Private Key encoded in hex or base64
     * @param updateMsgNonce Boolean indicating whether the message's nonce should be updated or not
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async sendMessage(
        message: Message,
        privateKey: PrivateKey,
        updateMsgNonce: Boolean = true,
        waitMsg: Boolean = false
    ): Promise<CID | object> {
        if (updateMsgNonce) {
            // Get Address Nonce
            message.Nonce = await this.lotus.mpool.getNonce(message.From);
        }

        // Get Unsigned Message with Gas Estimation
        const unsignedMessage = await this.lotus.gasEstimate.messageGas(message);

        // Sign Message
        const signedMessage = JSON.parse(this.transactionSignLotus(unsignedMessage, privateKey));

        // Send Message
        const CID = await this.lotus.mpool.push(signedMessage);

        if (waitMsg) {
            return await this.lotus.state.waitMsg(CID, 0);
        }

        return CID;
    }

    /**
     * @notice Send FIL to recipient
     * @param to The recipient's address
     * @param amount The amount of FIL to send
     * @param gasLimit The Message's gas limit to use
     * @param privateKey Private key encoded as hex or base64
     * @param network mainnet or testnet
     * @param waitMsg Boolean indicating wether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async send(
        to: Address,
        amount: TokenAmount,
        gasLimit: number,
        privateKey: PrivateKey,
        network: Network,
        waitMsg: Boolean = false
    ): Promise<CID | object> {
        if (gasLimit < 1) {
            throw new Error("Invalid gas limit");
        }

        // Recover keys from private key
        const keys = new Wallet().keyRecover(privateKey, network);

        const from = keys.address;

        // Get Address Nonce
        const nonce = await this.lotus.mpool.getNonce(from);

        // Prepare Message
        const message: Message = {
            From: from,
            To: to,
            Nonce: nonce,
            Value: amount,
            GasLimit: gasLimit,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: 0,
            Params: "",
        };

        // Get Unsigned Message with Gas Estimation
        const unsignedMessage = await this.lotus.gasEstimate.messageGas(message);

        // Sign Message
        const signedMessage = JSON.parse(this.transactionSignLotus(unsignedMessage, privateKey));

        // Send Message
        const CID = await this.lotus.mpool.push(signedMessage);

        if (waitMsg) {
            return await this.lotus.state.waitMsg(CID, 0);
        }

        return CID;
    }

    public transactionParse(cborMessage: string, network: Network) {
        const decoded = cbor.util.deserialize(Buffer.from(cborMessage, "hex"));

        if (decoded[0] !== 0) {
            throw new Error("Unsupported version");
        }

        if (Object.values(decoded).length < 10) {
            throw new Error("The cbor message is missing some fields... please verify you have 9 fields");
        }

        if (decoded[4][0] === 0x01) {
            throw new Error("Value can't be negative");
        }

        const message = {
            to: bytesToAddress(decoded[1], network === "testnet"),
            from: bytesToAddress(decoded[2], network === "testnet"),
            nonce: decoded[3],
            value: new BN(decoded[4].toString("hex"), 16).toString(10),
            gaslimit: decoded[5],
            gasfeecap: new BN(decoded[6].toString("hex"), 16).toString(10),
            gaspremium: new BN(decoded[7].toString("hex"), 16).toString(10),
            method: decoded[8],
            params: decoded[9].toString(),
        };

        return message;
    }

    /**
     * @notice Serialize Message
     * @param message
     * @returns
     */
    public transactionSerializeRaw(message: Message) {
        const to = addressAsBytes(message.To);
        const from = addressAsBytes(message.From);
        const value = serializeBigNum(message.Value.toString());
        const gasfeecap = serializeBigNum(message.GasFeeCap.toString());
        const gaspremium = serializeBigNum(message.GasPremium.toString());

        const message_to_encode = [
            0,
            to,
            from,
            message.Nonce,
            value,
            message.GasLimit,
            gasfeecap,
            gaspremium,
            message.Method,
            Buffer.from(message.Params, "base64"),
        ];

        return cbor.util.serialize(message_to_encode);
    }

    /**
     * @notice Sign a message for lotus
     * @param unsignedMessage Cbor encoded or Message object
     * @param privateKey Private Key encoded in hex or base64
     * @returns SignedMessage as string
     */
    public transactionSignLotus(unsignedMessage: string | Message, privateKey: PrivateKey): string {
        let message;

        if (typeof unsignedMessage === "object") {
            message = this.transactionSerializeRaw(unsignedMessage);
        }

        if (typeof unsignedMessage === "string") {
            message = Buffer.from(unsignedMessage, "hex");
        }

        // Convert private key to buffer
        const privateKeyBuffer = tryToPrivateKeyBuffer(privateKey);

        // Get message digest
        const messageDigest = getDigest(message);

        // Sign message digest
        let signature = secp256k1.ecdsaSign(messageDigest, privateKeyBuffer);

        // Format signature
        signature = Buffer.concat([Buffer.from(signature.signature), Buffer.from([signature.recid])]);

        // Format signed message
        const signedMessage = {
            signature: {
                data: signature.toString("base64"),
                type: ProtocolIndicator.SECP256K1,
            },
            message: lowercaseKeys(unsignedMessage),
        };

        return JSON.stringify({
            Message: {
                From: signedMessage.message.from,
                GasLimit: signedMessage.message.gaslimit,
                GasFeeCap: signedMessage.message.gasfeecap,
                GasPremium: signedMessage.message.gaspremium,
                Method: signedMessage.message.method,
                Nonce: signedMessage.message.nonce,
                Params: signedMessage.message.params,
                To: signedMessage.message.to,
                Value: signedMessage.message.value,
            },
            Signature: {
                Data: signedMessage.signature.data,
                Type: signedMessage.signature.type,
            },
        });
    }

    /**
     * @notice Verify a SignedMessage
     * @param signedMessage Lotus formatted signed message
     * @returns Boolean indicating wether the message's signature is valid
     */
    public transactionVerifyLotus(signedMessage: SignedMessage): Boolean {
        // Convert signature (base64) to buffer
        const signatureBuffer = Buffer.from(signedMessage.Signature.Data, "base64");

        // Serialize Message
        const message = this.transactionSerializeRaw(signedMessage.Message);

        // Get Message digest
        const messageDigest = getDigest(message);

        // Recover public key
        const publicKey = secp256k1.ecdsaRecover(
            signatureBuffer.slice(0, -1),
            signatureBuffer[64],
            messageDigest,
            false
        );

        // Get filecoin network from `Message.From`
        const network = signedMessage.Message.From[0] as FilecoinNetwork;

        // Compare recovered address from signature to `Message.From`
        if (publicKeyToAddress(publicKey, network) !== signedMessage.Message.From) {
            throw new Error("Recovered address does not match the signer address");
        }

        // Verify recovered signature
        return secp256k1.ecdsaVerify(signatureBuffer.slice(0, -1), messageDigest, publicKey);
    }
}
