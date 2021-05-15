import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import * as Utils from "../signing-tools/methods/utils";
import { PaymentChannel } from "./methods/payment-channel";
import { Tx } from "./methods/tx";
import { Wallet } from "./methods/wallet";
import { FilecoinSigner } from "../signing-tools";

export class FilecoinClient {
    private readonly lotus: LotusClient;

    public readonly paych: PaymentChannel;
    public readonly tx: Tx;
    public readonly wallet: Wallet;
    public readonly utils: typeof Utils;
    public readonly signingTools: FilecoinSigner;

    constructor(rpcUrl: string, token?: string) {
        const connector = new HttpJsonRpcConnector({ url: rpcUrl, token });
        this.lotus = new LotusClient(connector);
        this.signingTools = new FilecoinSigner();
        this.tx = new Tx(this.lotus, this.signingTools);
        this.paych = new PaymentChannel(this.tx, this.signingTools);
        this.wallet = new Wallet(this.tx, this.signingTools);
        this.utils = Utils;
    }
}
