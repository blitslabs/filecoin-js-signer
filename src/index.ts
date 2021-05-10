import { Tx } from "./methods/tx";
import { Wallet } from "./methods/wallet";
import * as Utils from "./methods/utils";
import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import { PaymentChannel } from "./methods/payment-channel";

export class FilecoinSigner {
    private readonly lotus: LotusClient;

    public readonly paych: PaymentChannel;
    public readonly tx: Tx;
    public readonly wallet: Wallet;
    public readonly utils: typeof Utils;

    constructor(rpcUrl?: string, token?: string) {
        const connector = new HttpJsonRpcConnector({ url: rpcUrl, token });
        this.lotus = new LotusClient(connector);
        this.tx = new Tx(this.lotus);
        this.paych = new PaymentChannel(this.tx);
        this.wallet = new Wallet(this.tx);
        this.utils = Utils;
    }
}
