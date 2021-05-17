import {Multisig} from "../../../src/signing-tools/methods/multisig";

import * as wasmSigningTools from "@blits-labs/filecoin-signing-tools/nodejs";
import BigNumber from "bignumber.js";

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


    it("should create a init msig actor message", async () => {
        const wasmResult = wasmSigningTools.createMultisig(from, addresses, "100", 2, 0, "0", "0");
        const result = await msig.createMultisig(from, addresses, new BigNumber(100), 2, 0, "0", "0", "testnet");
        console.log({result, wasmResult})
    })
})
