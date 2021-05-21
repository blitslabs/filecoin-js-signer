import {Multisig} from "../../../src/signing-tools/methods/multisig";

import * as wasmSigningTools from "@blits-labs/filecoin-signing-tools/nodejs";
import BigNumber from "bignumber.js";
import {CodeCID} from "../../../src/core/types/types";
import {FilecoinClient} from "../../../src/client";

describe("multisig test", () => {
    let msig: Multisig;
    const from = "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci";
    const signers = ["t1d2xrzcslx7xlbbylc5c3d5lvandqw4iwl6epxba", "t137sjdbgunloi7couiy4l5nc7pd6k2jmq32vizpy"];
    const multisigAddress = "t01004";

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
        const result = await msig.createMsigParams(signers, 2, 0, 0, "fil/2/multisig" as CodeCID);

        expect(result).toEqual(wasmResult);
    })

    it("should create a init msig actor message", async () => {
        const wasmResult = wasmSigningTools.createMultisig(from, signers, "100", 2, 0, "3", "6");
        const result = await msig.createMultisigMsg(from, signers, new BigNumber(100),
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

    it("should propose a multisig", async () => {
        const wasmResult = wasmSigningTools.proposeMultisig(multisigAddress, signers[0], from, "100", 0);
        const result = await msig.proposeMultisigMsg(multisigAddress, from, signers[0], new BigNumber(100), 0);

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

    it("should create a approve multisig message", async () => {
        const wasmResult = wasmSigningTools.approveMultisig(multisigAddress, 1234, signers[0], signers[1], "100", from, 0);
        const result = await msig.approveMultisigMsg(multisigAddress, 1234, signers[0], from, signers[1], new BigNumber(100), 0);

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

    it("should create a cancel multisig message", async () => {
        const wasmResult = wasmSigningTools.cancelMultisig(multisigAddress, 1234, signers[0], signers[1], "100", from, 0);
        const result = await msig.cancelMultisigMsg(multisigAddress, 1234, signers[0], from, signers[1], new BigNumber(100), 0);

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
