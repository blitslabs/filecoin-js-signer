import {Multisig} from "../../../src/signing-tools/methods/multisig";

import * as wasmSigningTools from "@blits-labs/filecoin-signing-tools/nodejs";
import BigNumber from "bignumber.js";
import {CodeCID} from "../../../src/core/types/types";
import {FilecoinClient} from "../../../src/client";

jest.setTimeout(10000)
describe("multisig test", () => {
    let msig: Multisig;
    const from = "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci";
    const signers = ["t1d2xrzcslx7xlbbylc5c3d5lvandqw4iwl6epxba", "t137sjdbgunloi7couiy4l5nc7pd6k2jmq32vizpy"]

    beforeEach(()=>{
        msig = new Multisig();
    })

    it("should create a init msig actor constructor params", async () => {
        const params = {
            code_cid: "fil/2/multisig",
            constructor_params: Buffer.from(wasmSigningTools.serializeParams(
                {
                    Signers: signers,
                    NumApprovalsThreshold: 2,
                    UnlockDuration: 0,
                    StartEpoch: 0
                }
            )).toString("base64")
        };
        const wasmResult = Buffer.from(wasmSigningTools.serializeParams(params)).toString("base64");
        const result = await msig.createMsigMsgParams(signers, 2, 0, 0, "fil/2/multisig" as CodeCID);

        expect(result).toEqual(wasmResult);
    })

    it("should create a init msig actor message", async () => {
        const wasmResult = wasmSigningTools.createMultisig(from, signers, "100", 2, 0, "3", "6");
        const result = await msig.createMultisig(from, signers, new BigNumber(100),
            2, 0, 3, 6,
            "testnet", "fil/2/multisig" as CodeCID);

        const fixedResult = {
            from: result.From,
            to: result.To,
            nonce: result.Nonce,
            value: result.Value.toString(),
            gaslimit: result.GasLimit,
            gasfeecap: result.GasFeeCap.toString(),
            gaspremium: result.GasPremium.toString(),
            method: result.Method,
            params: result.Params,
        };

        expect(fixedResult).toEqual(wasmResult);
    })
})
