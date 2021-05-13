import {FilecoinSigner} from "../src";
import BigNumber from "bignumber.js";

jest.setTimeout(10000);

describe("filecoin signer test", () => {
    let signer: FilecoinSigner;
    const address = "t1o45uzfwlghly7dubahkb5ucoq5e3vg4hcfwcfzy";
    const privateKey = "VTkiC5eaUin471c/ogE1HvBocxSa1OWzDCK1rr+4aIE=";
    const to = "t1aexhfgaaowzz2wryy7b6q5y3zs7tjhybfmqetta";

    beforeEach(() => {
        signer = new FilecoinSigner("https://calibration.node.glif.io/rpc/v0");
    })

   describe("payment channels", () => {
       it("should create a payment channel", async () => {
           const cid = await signer.paych.createPaymentChannel(address, to, new BigNumber(100), privateKey, "testnet");
           expect(cid["/"]).toBeDefined();
       });
   })
});
