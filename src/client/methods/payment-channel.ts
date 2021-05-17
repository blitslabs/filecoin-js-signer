import {
    Address,
    CID,
    HashedSecret,
    Network,
    PrivateKey,
    SignedVoucherBase64,
    TokenAmount,
} from "../../core/types/types";
import { Tx } from "./tx";
import { FilecoinSigner } from "../../signing-tools";

export class PaymentChannel {
    constructor(private readonly tx: Tx, private readonly signingTools: FilecoinSigner) {}

    /**
     * @notice Creates the payment channel in the network
     * @param from The FIL address of the sender
     * @param to The FIL address of the recipient
     * @param amount The amount of FIL to send
     * @param privateKey Private key of the signer
     * @param network The network of the message
     * @returns
     */
    public async createPaymentChannel(
        from: Address,
        to: Address,
        amount: TokenAmount,
        privateKey: PrivateKey,
        network: Network = "mainnet"
    ): Promise<CID> {
        let message = await this.signingTools.paych.createPaymentChannelMsg(from, to, amount, 0, network);
        return this.tx.sendMessage(message, privateKey);
    }

    /**
     * @notice Creates the message to settle the payment channel
     * @param paymentChannelAddress The address of the payment channel
     * @param from Address of the sender
     * @param privateKey Private key of the sender
     * @returns
     */
    public async settlePaymentChannel(
        paymentChannelAddress: Address,
        from: Address,
        privateKey: PrivateKey
    ): Promise<CID> {
        let message = this.signingTools.paych.settlePaymentChannelMsg(paymentChannelAddress, from, 0);
        return this.tx.sendMessage(message, privateKey);
    }

    /**
     * @notice Updates the payment channel
     * @param paymentChannelAddress Address of the payment channel
     * @param from The FIL address of the sender
     * @param signedVoucher Signed voucher encoded in base64
     * @param secret The hashed secret required to redeem the voucher
     * @param privateKey Private key of the sender
     * @returns
     */
    public async updatePaymentChannel(
        paymentChannelAddress: Address,
        from: Address,
        signedVoucher: SignedVoucherBase64,
        secret: HashedSecret,
        privateKey: PrivateKey
    ): Promise<CID> {
        let message = this.signingTools.paych.updatePaymentChannelMsg(
            paymentChannelAddress,
            from,
            signedVoucher,
            secret,
            0
        );
        return this.tx.sendMessage(message, privateKey);
    }

    /**
     * @notice Collects the payment channel funds
     * @param paymentChannelAddress Address of the payment channel
     * @param from The FIL address of the sender
     * @param privateKey Private key of the sender
     * @returns
     */
    public async collectPaymentChannel(
        paymentChannelAddress: Address,
        from: Address,
        privateKey: PrivateKey
    ): Promise<CID> {
        let message = this.signingTools.paych.collectPaymentChannelMsg(paymentChannelAddress, from, 0);
        return this.tx.sendMessage(message, privateKey);
    }
}
