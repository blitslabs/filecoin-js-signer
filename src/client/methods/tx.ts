import { LotusClient } from "filecoin.js";
import { Message, PrivateKey, Network, Address, TokenAmount, CID, MessageResponse } from "../../core/types/types";
import BigNumber from "bignumber.js";
import { FilecoinSigner } from "../../signing-tools";

export class Tx {
    constructor(public readonly clientProvider: LotusClient, private readonly signingTools: FilecoinSigner) {}

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
        updateMsgNonce: boolean = true,
        waitMsg: boolean = false
    ): Promise<MessageResponse> {
        if (updateMsgNonce) {
            // Get Address Nonce
            message.Nonce = await this.clientProvider.mpool.getNonce(message.From);
        }

        return this.pushMessage(message, privateKey, waitMsg);
    }

    /**
     * @notice Send FIL to recipient
     * @param to The recipient's address
     * @param amount The amount of FIL to send
     * @param gasLimit The Message's gas limit to use
     * @param privateKey Private key encoded as hex or base64
     * @param network mainnet or testnet
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async send(
        to: Address,
        amount: TokenAmount,
        gasLimit: number,
        privateKey: PrivateKey,
        network: Network,
        waitMsg: boolean = false
    ): Promise<MessageResponse> {
        if (gasLimit < 1) {
            throw new Error("Invalid gas limit");
        }

        // Recover keys from private key
        const keys = this.signingTools.wallet.keyRecover(privateKey, network);

        const from = keys.address;

        // Get Address Nonce
        const nonce = await this.clientProvider.mpool.getNonce(from);

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

        return await this.pushMessage(message, privateKey, waitMsg);
    }

    /**
     * @notice Send FIL to recipient
     * @param message Message to be sent
     * @param privateKey Private key encoded as hex or base64
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    private async pushMessage(message: Message, privateKey: PrivateKey, waitMsg: boolean): Promise<MessageResponse> {
        // Get Unsigned Message with Gas Estimation
        const unsignedMessage = await this.clientProvider.gasEstimate.messageGas(message);

        // Sign Message
        const signedMessage = JSON.parse(this.signingTools.tx.transactionSignLotus(unsignedMessage, privateKey));

        // Send Message
        const CID = await this.clientProvider.mpool.push(signedMessage);

        if (waitMsg) {
            return await this.clientProvider.state.waitMsg(CID, 0);
        }

        return CID;
    }
}
