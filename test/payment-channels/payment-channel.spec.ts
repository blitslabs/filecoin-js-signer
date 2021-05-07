import { PaymentChannel } from "../../src/payment-channels/payment-channel";
import * as wasmSigningTools from "@blits-labs/filecoin-signing-tools/nodejs";
import {CodeCID, INIT_ACTOR, InitMethod} from "../../src/core/types/types";
import {serialize} from "v8";
import BigNumber from "bignumber.js";
import blake2b from 'blake2b'

describe("payment channels", () => {
    let paymentChannel: PaymentChannel;
    const from = "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci";
    const to = "t1aexhfgaaowzz2wryy7b6q5y3zs7tjhybfmqetta";
    const paychAddress = "t01312"

    beforeEach(() => {
        paymentChannel = new PaymentChannel();
    });

    it("should encode the payment channel constructor params", async () => {
        const params = {
            code_cid: CodeCID.PaymentChannel,
            constructor_params: Buffer.from(wasmSigningTools.serializeParams({ from, to })).toString("base64"),
        };
        const wasmResult = Buffer.from(wasmSigningTools.serializeParams(params)).toString("base64");

        const result = await paymentChannel.createPayChMsgParams(from, to);

        expect(result).toEqual(wasmResult);
    });

    it("should create the payment channel creation message", async () => {
        const amount = new BigNumber(100);
        const params = {
            code_cid: CodeCID.PaymentChannel,
            constructor_params: Buffer.from(wasmSigningTools.serializeParams({ from, to })).toString("base64"),
        };
        const serializedParams = Buffer.from(wasmSigningTools.serializeParams(params)).toString("base64");

        const result = await paymentChannel.createPayChMsg(from, to, amount, 0);

        const expected = {
            From: from,
            To: "t01",
            Nonce: 0,
            Value: amount,
            GasLimit: 10000000,
            GasFeeCap: new BigNumber(0),
            GasPremium: new BigNumber(0),
            Method: 2,
            Params: serializedParams,
        }

        expect(result).toEqual(expected);
    });

    it("should create a serialized voucher", async () => {
        const bSecret = Buffer.from("secret");
        const secretPreImage = blake2b(new Uint8Array(32).length)
            .update(bSecret)
            .digest('hex');
        const wasmResult = wasmSigningTools.createVoucher(paychAddress, "0","0", secretPreImage, "10", "0", "0", "0");
        const result = await paymentChannel.createVoucher(paychAddress, 0,0, secretPreImage, new BigNumber(10), 0, 0, 0);
        expect(result).toEqual(wasmResult);
    });
});