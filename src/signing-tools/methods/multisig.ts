import {
    Address,
    CodeCID,
    INIT_ACTOR,
    InitMethod,
    Message,
    MsgParams,
    Network,
    TokenAmount
} from "../../core/types/types";
import cbor from "ipld-dag-cbor";
import {addressAsBytes} from "./utils";
import {multihash} from "multihashing-async";
import BigNumber from "bignumber.js";

export class Multisig {
    /**
     * @notice Encodes the message's params required to create a multisig
     * @param addresses
     * @param requiredNumberOfApprovals
     * @param unlockDuration
     * @param startEpoch
     * @param codeCID CID of the Payment Channel Actor
     * @returns Message params in base64
     */
    public async createMsigMsgParams(addresses: Address[],requiredNumberOfApprovals: number,
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

    public async createMultisig(from: Address, addresses: Address[], amount: TokenAmount,
                   requiredNumberOfApprovals: number, nonce: number, unlockDuration: number, startEpoch: number,
                   network: Network = "mainnet",
                   codeCID: CodeCID = CodeCID.Multisig) {
        const message: Message = {
            From: from,
            To: INIT_ACTOR[network],
            Nonce: nonce,
            Value: amount,
            GasLimit: 10000000,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: InitMethod.Exec,
            Params: await this.createMsigMsgParams(addresses, requiredNumberOfApprovals, unlockDuration, startEpoch, codeCID),
        };

        return message;
    }
}
