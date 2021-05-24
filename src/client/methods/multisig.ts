import { Tx } from "./tx";
import { FilecoinSigner } from "../../signing-tools";
import { Address, CID, CodeCID, MessageResponse, Network, PrivateKey, TokenAmount } from "../../core/types/types";

export class Multisig {
    constructor(private readonly tx: Tx, private readonly signingTools: FilecoinSigner) {}

    /**
     * @notice Creates multisig
     * @notice Creates a create multisig message
     * @param from FIL address of the sender
     * @param addresses Addresses of the signers.
     * @param amount The amount of FIL to send
     * @param requiredNumberOfApprovals Required number of approvals.
     * @param nonce The nonce of the sender's account
     * @param unlockDuration Duration threshold to unlock.
     * @param startEpoch Initial epoch,
     * @param codeCID CID of the Payment Channel Actor
     * @param privateKey Private key of the signer
     * @param network The network of the message
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async createMultisig(
        from: Address,
        addresses: Address[],
        amount: TokenAmount,
        requiredNumberOfApprovals: number,
        nonce: number,
        unlockDuration: number,
        startEpoch: number,
        codeCID: CodeCID = CodeCID.Multisig,
        privateKey: PrivateKey,
        network: Network = "mainnet",
        waitMsg: boolean = false
    ): Promise<MessageResponse> {
        const message = await this.signingTools.msig.createMultisigMsg(
            from,
            addresses,
            amount,
            requiredNumberOfApprovals,
            nonce,
            unlockDuration,
            startEpoch,
            network,
            codeCID
        );
        return this.tx.sendMessage(message, privateKey, true, waitMsg);
    }

    /**
     * @notice Proposes multisig
     * @notice Creates propose multisig message
     * @param multisigAddress Address of the created multisig
     * @param from Sender's FIL address
     * @param to Recipient's FIL address
     * @param amount FIL amount to propose
     * @param nonce Sender's nonce
     * @param privateKey Private key of the signer
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async proposeMultisig(
        multisigAddress: Address,
        from: Address,
        to: Address,
        amount: TokenAmount,
        nonce: number,
        privateKey: PrivateKey,
        waitMsg: boolean = false
    ): Promise<MessageResponse> {
        const message = await this.signingTools.msig.proposeMultisigMsg(multisigAddress, from, to, amount, nonce);
        return this.tx.sendMessage(message, privateKey, true, waitMsg);
    }

    /**
     * @notice Approves multisig
     * @notice Creates a message to approve multisig
     * @param multisigAddress Address of the created multisig
     * @param messageId: Id of the transaction
     * @param requester: FIL address of the requester
     * @param from Sender's FIL address
     * @param to Recipient's FIL address
     * @param amount FIL amount to approve/cancel
     * @param nonce Sender's nonce
     * @param privateKey Private key of the signer
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async approveMultisig(
        multisigAddress: Address,
        messageId: number,
        requester: Address,
        from: Address,
        to: Address,
        amount: TokenAmount,
        nonce: number,
        privateKey: PrivateKey,
        waitMsg: boolean = false
    ): Promise<MessageResponse> {
        const message = await this.signingTools.msig.approveMultisigMsg(
            multisigAddress,
            messageId,
            requester,
            from,
            to,
            amount,
            nonce
        );
        return this.tx.sendMessage(message, privateKey, true, waitMsg);
    }

    /**
     * @notice Cancels multisig
     * @notice Creates a message to approve multisig
     * @param multisigAddress Address of the created multisig
     * @param messageId: Id of the transaction
     * @param requester: FIL address of the requester
     * @param from Sender's FIL address
     * @param to Recipient's FIL address
     * @param amount FIL amount to approve/cancel
     * @param nonce Sender's nonce
     * @param privateKey Private key of the signer
     * @param waitMsg Boolean indicating whether to wait for the message to confirm or not
     * @returns CID if waitMsg = false. Message's receipt if waitMsg = true
     */
    public async cancelMultisig(
        multisigAddress: Address,
        messageId: number,
        requester: Address,
        from: Address,
        to: Address,
        amount: TokenAmount,
        nonce: number,
        privateKey: PrivateKey,
        waitMsg: boolean = false
    ): Promise<MessageResponse> {
        const message = await this.signingTools.msig.cancelMultisigMsg(
            multisigAddress,
            messageId,
            requester,
            from,
            to,
            amount,
            nonce
        );
        return this.tx.sendMessage(message, privateKey, true, waitMsg);
    }
}
