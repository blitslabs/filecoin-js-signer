import {
    Address,
    CodeCID,
    INIT_ACTOR,
    InitMethod,
    Message,
    MsgParams, MultisigMethod,
    Network,
    TokenAmount
} from "../../core/types/types";
import cbor from "ipld-dag-cbor";
import {addressAsBytes, createHash, serializeBigNum} from "./utils";
import {multihash} from "multihashing-async";
import BigNumber from "bignumber.js";

export class Multisig {
    /**
     * @notice Encodes the message's params required to create a multisig
     * @param addresses Addresses of the signers.
     * @param requiredNumberOfApprovals Required number of approvals.
     * @param unlockDuration Duration threshold to unlock.
     * @param startEpoch Initial epoch,
     * @param codeCID CID of the Payment Channel Actor
     * @returns Message params in base64
     */
    public async createMsigParams(addresses: Address[],requiredNumberOfApprovals: number,
                                     unlockDuration: number, startEpoch: number, codeCID: CodeCID): Promise<MsgParams> {

        const byteAddresses = addresses.map((add)=>addressAsBytes(add));

        let constructor_params = cbor.util.serialize([
            [
                byteAddresses,
                requiredNumberOfApprovals,
                unlockDuration,
                startEpoch
            ]
        ]);

        constructor_params = constructor_params.slice(1);

        const cid = await cbor.util.cid(Buffer.from(codeCID), {
            hashAlg: multihash.names["identity"],
        });

        const params = [cid, constructor_params];

        const serialized_params = cbor.util.serialize(params);

        return Buffer.from(serialized_params).toString("base64");
    }


    /**
     * @notice Creates a create multisig message
     * @param from FIL address of the sender
     * @param addresses Addresses of the signers.
     * @param amount The amount of FIL to send
     * @param requiredNumberOfApprovals Required number of approvals.
     * @param nonce The nonce of the sender's account
     * @param unlockDuration Duration threshold to unlock.
     * @param startEpoch Initial epoch,
     * @param network The network of the message
     * @param codeCID CID of the Payment Channel Actor
     * @returns Message params in base64
     */
    public async createMultisigMsg(from: Address, addresses: Address[], amount: TokenAmount,
                                   requiredNumberOfApprovals: number, nonce: number, unlockDuration: number, startEpoch: number,
                                   network: Network = "mainnet",
                                   codeCID: CodeCID = CodeCID.Multisig): Promise<Message> {
        const message: Message = {
            From: from,
            To: INIT_ACTOR[network],
            Nonce: nonce,
            Value: amount,
            GasLimit: 0,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: InitMethod.Exec,
            Params: await this.createMsigParams(addresses, requiredNumberOfApprovals, unlockDuration, startEpoch, codeCID),
        };

        return message;
    }

    /**
     * @notice Encodes the message's params required to propose a multisig
     * @param to Recipient's FIL address
     * @param amount FIL amount to propose
     * @returns Message params in base64
     */
    public proposeMsigMsgParams(to: Address, amount: TokenAmount): MsgParams {
        const propose_params = cbor.util.serialize([
            [
                addressAsBytes(to),
                serializeBigNum(amount.toString()),
                0,
                new Buffer(0)
            ]
        ]);

        return Buffer.from(propose_params.slice(1)).toString("base64");
    }


    /**
     * @notice Creates propose multisig message
     * @param multisigAddress Address of the created multisig
     * @param from Sender's FIL address
     * @param to Recipient's FIL address
     * @param amount FIL amount to propose
     * @param nonce Sender's nonce
     * @returns Message params in base64
     */
    public proposeMultisigMsg(multisigAddress: Address, from: Address,  to: Address, amount: TokenAmount, nonce: number): Message {
        const message: Message = {
            From: from,
            To: multisigAddress,
            Nonce: nonce,
            Value: new BigNumber(0),
            GasLimit: 0,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: MultisigMethod.Propose,
            Params: this.proposeMsigMsgParams(to, amount),
        };

        return message;
    }



    /**
     * @notice Encodes the message's params required to approve/cancel a multisig
     * @param messageId: Id of the transaction
     * @param requester: FIL address of the requester
     * @param to Recipient's FIL address
     * @param amount FIL amount to approve/cancel
     * @returns Message params in base64
     */
    public approveOrCancelMsigMsgParams(messageId: number, requester: Address, to: Address, amount: TokenAmount): MsgParams {
        const propose_params = cbor.util.serialize([
            [
                addressAsBytes(requester),
                addressAsBytes(to),
                serializeBigNum(amount.toString()),
                0,
                new Buffer(0)
            ]
        ]);

        const serializedProposalParams =  Buffer.from(propose_params.slice(1));

        const hash = createHash(serializedProposalParams);

        const params = cbor.util.serialize([
            [
                messageId,
                hash
            ]
        ]);

        return Buffer.from(params).slice(1).toString("base64")
    }


    /**
     * @notice Encodes the message's params required to approve/cancel a multisig
     * @param multisigAddress Address of the created multisig
     * @param messageId: Id of the transaction
     * @param requester: FIL address of the requester
     * @param from Sender's FIL address
     * @param to Recipient's FIL address
     * @param amount FIL amount to approve/cancel
     * @param nonce Sender's nonce
     * @returns Message params in base64
     */
    public approveMultisigMsg(multisigAddress: Address, messageId: number, requester: Address,
                              from: Address, to: Address, amount: TokenAmount, nonce: number): Message {
        const message: Message = {
            From: from,
            To: multisigAddress,
            Nonce: nonce,
            Value: new BigNumber(0),
            GasLimit: 0,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: MultisigMethod.Approve,
            Params: this.approveOrCancelMsigMsgParams(messageId, requester, to, amount),
        };

        return message;
    }
}
