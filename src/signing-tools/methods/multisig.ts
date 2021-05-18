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
import {addressAsBytes, serializeBigNum} from "./utils";
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
                                   codeCID: CodeCID = CodeCID.Multisig) {
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
    public async proposeMsigMsgParams(to: Address, amount: TokenAmount): Promise<MsgParams> {
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


    public async proposeMultisigMsg(multisigAddress: Address, from: Address,  to: Address, amount: TokenAmount, nonce: number) {
        const message: Message = {
            From: from,
            To: multisigAddress,
            Nonce: nonce,
            Value: new BigNumber(0),
            GasLimit: 0,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: MultisigMethod.Propose,
            Params: await this.proposeMsigMsgParams(to, amount),
        };

        return message;
    }
}
