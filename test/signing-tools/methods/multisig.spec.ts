import {Multisig} from "../../../src/signing-tools/methods/multisig";

import * as wasmSigningTools from "@blits-labs/filecoin-signing-tools/nodejs";
import BigNumber from "bignumber.js";
import {CodeCID} from "../../../src/core/types/types";
import {FilecoinClient} from "../../../src/client";
import cbor from "ipld-dag-cbor";
import {addressAsBytes} from "../../../src/signing-tools/methods/utils";

jest.setTimeout(10000)
describe("multisig test", () => {
    let msig: Multisig;
    const from = "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci";
    const addresses = [
        "t1aexhfgaaowzz2wryy7b6q5y3zs7tjhybfmqetta",
        "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci"
    ]

    beforeEach(()=>{
        msig = new Multisig();
    })

    it("should serialize", ()=>{
        const expected = Buffer.from(wasmSigningTools.serializeParams(
            {
                Signers: addresses,
                NumApprovalsThreshold: 1,
                UnlockDuration: 2,
                StartEpoch: 3
            }
        )).toString("base64");

        const constructor_params = Buffer.from(cbor.util.serialize([
            [
                addresses.map((add)=>addressAsBytes(add)),
                1,
                "2",
                "3"
            ]
        ])).toString("base64");

        expect(constructor_params).toEqual(expected);
    })


    it("should create a init msig actor constructor params", async () => {
        const params = {
            code_cid: "fil/3/multisig",
            constructor_params: Buffer.from(wasmSigningTools.serializeParams(
                {
                    Signers: addresses,
                    NumApprovalsThreshold: 2,
                    UnlockDuration: 0,
                    StartEpoch: 0
                }
            )).toString("base64")
        };
        console.log({params: params.constructor_params})
        const wasmResult = Buffer.from(wasmSigningTools.serializeParams(params)).toString("base64");

        const result = await msig.createMsigMsgParams(addresses, 2, "0", "0", "fil/4/multisig" as CodeCID);
    })

    it("should create a init msig actor message", async () => {
        const wasmResult = wasmSigningTools.createMultisig(from, addresses, "100", 2, 0, "0", "0");
        const result = await msig.createMultisig(from, addresses, new BigNumber(100),
            2, 0, "0", "0",
            "testnet", "fil/4/multisig" as CodeCID);

        const client = new FilecoinClient("https://calibration.node.glif.io/rpc/v0");
        const message = await client.tx.sendMessage(result, "b144cf14dbd413aaefaa4658bca06733aa33386e651ab9816954807c74517bf1");
        console.log({message})
        console.log({result, wasmResult})
    })
})
