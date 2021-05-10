import { Tx } from "./methods/tx";
import { Wallet } from "./methods/wallet";
import * as Utils from "./methods/utils";
import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import { PaymentChannel } from "./methods/payment-channel";

export class FilecoinSigner {
    public paych: PaymentChannel;
    public tx: Tx;
    public wallet: Wallet;
    public lotus: LotusClient;
    public utils: any;

    constructor(rpcUrl?: string, token?: string) {
        const connector = new HttpJsonRpcConnector({ url: rpcUrl, token });
        this.lotus = new LotusClient(connector);
        this.paych = new PaymentChannel();
        this.tx = new Tx(this.lotus);
        this.wallet = new Wallet();
        this.utils = Utils;
    }
}
