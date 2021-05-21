import { FilecoinSigner } from "../../../src/signing-tools";
import BigNumber from "bignumber.js";
import { FilecoinClient } from "../../../src/client";
import {MsgLookup} from "../../../src/core/types/types";

jest.setTimeout(30000);

describe("payment channel test", () => {
    let client: FilecoinClient;
    const address = "t1o45uzfwlghly7dubahkb5ucoq5e3vg4hcfwcfzy";
    const privateKey = "VTkiC5eaUin471c/ogE1HvBocxSa1OWzDCK1rr+4aIE=";
    const to = "t1aexhfgaaowzz2wryy7b6q5y3zs7tjhybfmqetta";

    beforeEach(() => {
        client = new FilecoinClient("https://calibration.node.glif.io/rpc/v0");
    });

    xit("should create a payment channel", async () => {
        const cid = await client.paych.createPaymentChannel(address, to, new BigNumber(100), privateKey, "testnet");
        expect(cid["/"]).toBeDefined();
    });

    describe("payment channel methods", () => {
        let paymentChannel: MsgLookup;
        beforeAll(async ()=> {
            client = new FilecoinClient("https://calibration.node.glif.io/rpc/v0");
            paymentChannel = await client.paych.createPaymentChannel(address, to, new BigNumber(10000000), privateKey,
                "testnet", true) as MsgLookup;
            console.log({paymentChannel})
        });

        it("should do something", () => {
            console.log({paymentChannel})
        })
    })

    it("should create a payment channel", async () => {
        const cid = await client.paych.createPaymentChannel(address, to, new BigNumber(100), privateKey, "testnet");
        expect(cid["/"]).toBeDefined();
    });
});
