import * as Utils from "./methods/utils";
import {PaymentChannelTools} from "./methods/payment-channel";
import {TxTools} from "./methods/tx";
import {WalletTools} from "./methods/wallet";

export class FilecoinSigner {
    public readonly paych: PaymentChannelTools;
    public readonly tx: TxTools;
    public readonly wallet: WalletTools;
    public readonly utils: typeof Utils;

    constructor() {
        this.tx = new TxTools();
        this.paych = new PaymentChannelTools();
        this.wallet = new WalletTools();
        this.utils = Utils;
    }
}
