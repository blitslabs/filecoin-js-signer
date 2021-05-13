import { FilecoinSigner } from "../../../src/signing-tools";
import BigNumber from "bignumber.js";
import { FilecoinClient } from "../../../src/client";

jest.setTimeout(10000);

describe("payment channel test", () => {
    let client: FilecoinClient;
    const address = "t1o45uzfwlghly7dubahkb5ucoq5e3vg4hcfwcfzy";
    const privateKey = "VTkiC5eaUin471c/ogE1HvBocxSa1OWzDCK1rr+4aIE=";
    const to = "t1aexhfgaaowzz2wryy7b6q5y3zs7tjhybfmqetta";

    beforeEach(() => {
        client = new FilecoinClient("https://calibration.node.glif.io/rpc/v0");
    });

    it("should create a payment channel", async () => {
        const cid = await client.paych.createPaymentChannel(address, to, new BigNumber(100), privateKey, "testnet");
        expect(cid["/"]).toBeDefined();
    });
});
