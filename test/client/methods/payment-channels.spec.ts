import BigNumber from "bignumber.js";
import { FilecoinClient } from "../../../src/client";
import {MsgLookup} from "../../../src/core/types/types";
import blake2b from "blake2b";

jest.setTimeout(100000);

describe("payment channel test", () => {
    let client: FilecoinClient;
    const address = "t1o45uzfwlghly7dubahkb5ucoq5e3vg4hcfwcfzy";
    const privateKey = "VTkiC5eaUin471c/ogE1HvBocxSa1OWzDCK1rr+4aIE=";
    const address2 = "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci";
    const privateKey2 = "b144cf14dbd413aaefaa4658bca06733aa33386e651ab9816954807c74517bf1";

    xdescribe("create payment channel", () => {
        beforeEach(() => {
            client = new FilecoinClient("https://calibration.node.glif.io/rpc/v0");
        });

        it("should create a payment channel", async () => {
            const cid = await client.paych.createPaymentChannel(address, address2, new BigNumber(100), privateKey, "testnet");
            expect(cid["/"]).toBeDefined();
        });
    })


    describe("payment channel methods", () => {
        let paymentChannel: MsgLookup;
        let paychAddress: string;
        const secretPreImage = blake2b(new Uint8Array(32).length).update(Buffer.from("secret")).digest("hex");
        beforeAll(async ()=> {
            client = new FilecoinClient(process.env.LOTUS_HOST, process.env.LOTUS_TOKEN);
            paymentChannel = await client.paych.createPaymentChannel(address, address2, new BigNumber(10000000), privateKey,
                "testnet", true) as MsgLookup;
            paychAddress = paymentChannel.ReturnDec.IDAddress;
        });

        it("should update payment channel", async () => {
            console.log({paychAddress})
            const voucher = await client.signingTools.paych.createVoucher(
                paychAddress,
                0,
                0,
                secretPreImage,
                new BigNumber(10),
                0,
                0,
                0
            );
            const signedVoucher = client.signingTools.paych.signVoucher(voucher, privateKey2);

            const message = await client.paych.updatePaymentChannel(paychAddress, address2, signedVoucher, secretPreImage, privateKey2, true);
            console.log({message})
        })
    })
});
