import BigNumber from "bignumber.js";
import cbor from "ipld-dag-cbor";
import { multihash } from "multihashing-async";
import secp256k1 from "secp256k1";
import blake2b from "blake2b";
import { publicKeyToAddress } from "@nodefactory/filecoin-address";
import {
    Address,
    TokenAmount,
    CodeCID,
    Nonce,
    MsgParams,
    INIT_ACTOR,
    InitMethod,
    PaymentChannelMethod,
    Message,
    Network,
    Voucher,
    PrivateKey,
    ProtocolIndicator,
    FilecoinNetwork, CID,
} from "../core/types/types";
import { addressAsBytes, serializeBigNum, tryToPrivateKeyBuffer } from "./utils";

import { InvalidVoucherSignature, ProtocolNotSupported, UnknownProtocolIndicator } from "../core/exceptions/errors";
import {Tx} from "./tx";

export class PaymentChannel {
    constructor(private readonly tx: Tx) {
    }

    /**
     * @notice Encodes the message's params required to create a payment channel
     * @param from The FIL address of the sender
     * @param to The FIL address of the recipient
     * @returns Message params in base64
     */
    public async createPayChMsgParams(from: Address, to: Address): Promise<MsgParams> {
        const constructor_params = cbor.util.serialize([addressAsBytes(from), addressAsBytes(to)]);

        const cid = await cbor.util.cid(Buffer.from(CodeCID.PaymentChannel), {
            hashAlg: multihash.names["identity"],
        });

        const params = [cid, constructor_params];
        const serialized_params = cbor.util.serialize(params);

        return Buffer.from(serialized_params).toString("base64");
    }

    /**
     * @notice Prepare the Message required to create a payment channel
     * @param from The FIL address of the sender
     * @param to The FIL address of the recipient
     * @param amount The amount of FIL to send
     * @param nonce The nonce of the sender's account
     * @param network The network of the message
     * @returns
     */
    public async createPayChMsg(
        from: Address,
        to: Address,
        amount: TokenAmount,
        nonce: Nonce,
        network: Network = "testnet"
    ): Promise<Message> {
        const message: Message = {
            From: from,
            To: INIT_ACTOR[network],
            Nonce: nonce,
            Value: amount,
            GasLimit: 10000000,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: InitMethod.Exec,
            Params: await this.createPayChMsgParams(from, to),
        };

        return message;
    }

    /**
     * @notice Creates the payment channel in the network
     * @param from The FIL address of the sender
     * @param to The FIL address of the recipient
     * @param amount The amount of FIL to send
     * @param privateKey Private key of the signer
     * @param network The network of the message
     * @returns
     */
    public createPaymentChannel = async (
        from: Address,
        to: Address,
        amount: TokenAmount,
        privateKey: PrivateKey,
        network: Network = "testnet"
    ): Promise<CID> => {
        let message = await this.createPayChMsg(from, to, amount, 0, network);
        return this.tx.sendMessage(message, privateKey);
    };



    /**
     * @notice Creates a payment channel voucher
     * @param paymentChannelAddress The address of the payment channel
     * @param timeLockMin The minimum lock time
     * @param timeLockMax The maximum lock time
     * @param secretHash The hashed secret required to redeem the voucher
     * @param amount The amount to be redeemed with the voucher
     * @param lane The lane of the payment channel this voucher is valid for
     * @param voucherNonce The nonce of the voucher
     * @param minSettleHeight The minimum settle height
     * @returns Voucher Unsigned voucher encoded in base64
     */

    public createVoucher(
        paymentChannelAddress: Address,
        timeLockMin: number,
        timeLockMax: number,
        secretHash: string,
        amount: TokenAmount,
        lane: number,
        voucherNonce: number,
        minSettleHeight: number
    ): Voucher {
        const voucher = [
            addressAsBytes(paymentChannelAddress),
            timeLockMin,
            timeLockMax,
            Buffer.from(secretHash, "hex"),
            null, // extra
            lane,
            voucherNonce,
            serializeBigNum(amount.toString()),
            minSettleHeight,
            [], // merges
            null, // signature
        ];

        const serializedVoucher = cbor.util.serialize(voucher);

        return Buffer.from(serializedVoucher).toString("base64");
    }

    /**
     * @notice Sign a payment channel voucher
     * @param voucher The unsigned voucher encoded in base64
     * @param privateKey The private key to sign the voucher with
     * @returns String The signed voucher encoded in base64
     */
    public signVoucher(voucher: Voucher, privateKey: PrivateKey): string {
        // Convert base64 voucher to buffer
        const cborUnsignedVoucher = Buffer.from(voucher, "base64");

        // Prepare private key
        privateKey = tryToPrivateKeyBuffer(privateKey);

        // Hash unsigned voucher with blake2b/256
        const messageDigest = blake2b(32).update(cborUnsignedVoucher).digest();

        // Sign voucher
        const signature = secp256k1.ecdsaSign(messageDigest, privateKey);

        // Deserialize voucher
        let unsignedVoucher = cbor.util.deserialize(cborUnsignedVoucher);

        // Format signature
        const sig = Buffer.concat([
            Buffer.from([1]), // ???
            Buffer.from(signature.signature),
            Buffer.from([signature.recid]),
        ]);

        // Save signature in voucher
        unsignedVoucher[10] = sig;

        // Serialize voucher
        const signedVoucher = cbor.util.serialize(unsignedVoucher);

        // Convert signed voucher to base64
        return Buffer.from(signedVoucher).toString("base64");
    }

    /**
     * @notice Verify the signature of a signed voucher
     * @param sv Signed voucher encoded in base64
     * @param signerAddress The address to which compare the recovered public key
     * @returns Boolean Indicates whether the signature is valid or not
     */
    public verifyVoucherSignature(sv: string, signerAddress: Address): boolean {
        // Convert base64 signed voucher to buffer
        const cborSignedVoucher = Buffer.from(sv, "base64");
        const signedVoucher = cbor.util.deserialize(cborSignedVoucher);

        // Check signature
        if (signedVoucher[10] === null || !signedVoucher[10]) {
            throw new InvalidVoucherSignature();
        }

        // Remove signature
        let unsignedVoucher = Object.assign([], signedVoucher);
        unsignedVoucher[10] = null;

        // Serialize unsigned voucher
        const cborUnsignedVoucher = cbor.util.serialize(unsignedVoucher);

        // Hash unsigned voucher with blake2b/256
        const messageDigest = blake2b(32).update(cborUnsignedVoucher).digest();

        // Prepare signature
        const signature = signedVoucher[10].slice(1);

        const protocolIndicator = signerAddress[1];

        switch (Number(protocolIndicator)) {
            case ProtocolIndicator.SECP256K1:
                const sig = signature.slice(0, -1);
                const recovery_id = signature[64];

                // Recover public key
                const publicKey = secp256k1.ecdsaRecover(sig, recovery_id, messageDigest, false);

                const network = signerAddress[0] as FilecoinNetwork;

                if (publicKeyToAddress(publicKey, network) !== signerAddress) {
                    throw new Error("Recovered address does not match the signer address");
                }

                return secp256k1.ecdsaVerify(sig, messageDigest, publicKey);

            case ProtocolIndicator.BLS:
                throw new ProtocolNotSupported("BLS");
            default:
                throw new UnknownProtocolIndicator();
        }
    }

    /**
     * @notice Create the message to update the payment channel given a voucher
     * @param paymentChannelAddress Address of the payment channel
     * @param from The FIL address of the sender
     * @param sv Signed voucher encoded in base64
     * @param secret The hashed secret required to redeem the voucher
     * @param nonce The nonce of the sender's account
     * @param gasLimit The gas limit value
     * @param gasFeeCap The gas fee cap  value
     * @param gasPremium The gas premium value
     * @returns
     */
    public updatePaymentChannelMsg(
        paymentChannelAddress: Address,
        from: Address,
        sv: string,
        secret: string,
        nonce: number,
        gasLimit: number = 0,
        gasFeeCap: string = "0",
        gasPremium: string = "0"
    ): Message {
        // Convert base64 signed voucher to buffer
        const cborSignedVoucher = Buffer.from(sv, "base64");

        // Deserialize signed voucher
        const signedVoucher = cbor.util.deserialize(cborSignedVoucher);

        // Update payment channel params
        const serialized_params = cbor.util.serialize([signedVoucher, Buffer.from(secret, "hex")]);

        // Prepare unsigned message
        const message: Message = {
            From: from,
            To: paymentChannelAddress,
            Nonce: nonce,
            Value: new BigNumber(0),
            GasLimit: gasLimit,
            GasFeeCap: new BigNumber(gasFeeCap),
            GasPremium: new BigNumber(gasPremium),
            Method: PaymentChannelMethod.UpdateChannelState,
            Params: Buffer.from(serialized_params).toString("base64"),
        };

        return message;
    }

    /**
     * @notice Creates the message to settle the payment channel
     * @param paymentChannelAddress The address of the payment channel
     * @param from Address of the sender
     * @param nonce The nonce of the sender's account
     * @param gasLimit The gas limit value
     * @param gasFeeCap The gas fee cap  value
     * @param gasPremium The gas premium value
     * @returns
     */
    public settlePaymentChannelMsg(
        paymentChannelAddress: Address,
        from: Address,
        nonce: Nonce,
        gasLimit: number = 0,
        gasFeeCap: string = "0",
        gasPremium: string = "0"
    ): Message {
        const message: Message = {
            From: from,
            To: paymentChannelAddress,
            Nonce: nonce,
            Value: new BigNumber(0),
            GasLimit: gasLimit,
            GasFeeCap: new BigNumber(gasFeeCap),
            GasPremium: new BigNumber(gasPremium),
            Method: PaymentChannelMethod.Settle,
            Params: "",
        };

        return message;
    }

    /**
     * @notice Creates the message to collect the payment channel
     * @param paymentChannelAddress The address of the payment channel
     * @param from Address of the sender
     * @param nonce The nonce of the sender's account
     * @param gasLimit The gas limit value
     * @param gasFeeCap The gas fee cap  value
     * @param gasPremium The gas premium value
     * @returns
     */
    public collectPaymentChannelMsg(
        paymentChannelAddress: Address,
        from: Address,
        nonce: Nonce,
        gasLimit: number = 0,
        gasFeeCap: string = "0",
        gasPremium: string = "0"
    ): Message {
        const message: Message = {
            From: from,
            To: paymentChannelAddress,
            Nonce: nonce,
            Value: new BigNumber(0),
            GasLimit: gasLimit,
            GasFeeCap: new BigNumber(gasFeeCap),
            GasPremium: new BigNumber(gasPremium),
            Method: PaymentChannelMethod.Collect,
            Params: "",
        };

        return message;
    }
}
