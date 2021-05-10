import { PaymentChannel } from "../../src/methods/payment-channel";
import * as wasmSigningTools from "@blits-labs/filecoin-signing-tools/nodejs";
import {CodeCID} from "../../src/core/types/types";
import BigNumber from "bignumber.js";
import blake2b from 'blake2b'

describe("payment channels", () => {
    let paymentChannel: PaymentChannel;
    const from = "t1vwxualsf6gx5jjl2fp7zh7gy6ailk4hnwgkroci";
    const privateKey = "b144cf14dbd413aaefaa4658bca06733aa33386e651ab9816954807c74517bf1";
    const to = "t1aexhfgaaowzz2wryy7b6q5y3zs7tjhybfmqetta";
    const paychAddress = "t01312";
    const secretPreImage = blake2b(new Uint8Array(32).length)
        .update(Buffer.from("secret"))
        .digest('hex');

    describe("message creation", () => {
        beforeEach(() => {
            paymentChannel = new PaymentChannel(undefined);
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
            const wasmResult = wasmSigningTools.createVoucher(paychAddress, "0","0", secretPreImage, "10", "0", "0", "0");
            const result = paymentChannel.createVoucher(paychAddress, 0,0, secretPreImage, new BigNumber(10), 0, 0, 0);
            expect(result).toEqual(wasmResult);
        });

        it("should sign voucher voucher", async () => {
            const voucher = paymentChannel.createVoucher(paychAddress, 0,0, secretPreImage, new BigNumber(10), 0, 0, 0);

            const wasmResult = wasmSigningTools.signVoucher(voucher, Buffer.from(privateKey, "hex"));
            const result = paymentChannel.signVoucher(voucher, privateKey);

            expect(result).toEqual(wasmResult);
        });

        it("should verify voucher signature", async () => {
            const voucher = await paymentChannel.createVoucher(paychAddress, 0,0, secretPreImage, new BigNumber(10), 0, 0, 0);
            const signedVoucher = paymentChannel.signVoucher(voucher, privateKey);

            const wasmResult = wasmSigningTools.verifyVoucherSignature(signedVoucher, from);
            const result = paymentChannel.verifyVoucherSignature(signedVoucher, from);

            expect(result).toEqual(wasmResult);
        });

        it("should create the message to update the payment channel given a voucher", async () => {
            const voucher = await paymentChannel.createVoucher(paychAddress, 0,0, secretPreImage, new BigNumber(10), 0, 0, 0);
            const signedVoucher = paymentChannel.signVoucher(voucher, privateKey);

            const wasmResult = wasmSigningTools.updatePymtChan(paychAddress, from, signedVoucher, secretPreImage, 0);
            const result = paymentChannel.updatePaymentChannelMsg(paychAddress, from, signedVoucher, secretPreImage, 0);

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
            }

            expect(fixedResult).toEqual(wasmResult);
        });


        it("should create the message to settle the payment channel", async () => {
            const voucher = await paymentChannel.createVoucher(paychAddress, 0,0, secretPreImage, new BigNumber(10), 0, 0, 0);
            const signedVoucher = paymentChannel.signVoucher(voucher, privateKey);

            const wasmResult = wasmSigningTools.settlePymtChan(paychAddress, from, 0);
            const result = paymentChannel.settlePaymentChannelMsg(paychAddress, from, 0);

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
            }

            expect(fixedResult).toEqual(wasmResult);
        });
    })

});
