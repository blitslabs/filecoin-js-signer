import * as Utils from "./methods/utils";
import { PaymentChannelTools } from "./methods/payment-channel";
import { TxTools } from "./methods/tx";
import { WalletTools } from "./methods/wallet";
import {MultisigTools} from "./methods/multisig";

export class FilecoinSigner {
    public readonly paych: PaymentChannelTools;
    public readonly tx: TxTools;
    public readonly wallet: WalletTools;
    public readonly msig: MultisigTools;
    public readonly utils: typeof Utils;

    constructor() {
        this.tx = new TxTools();
        this.paych = new PaymentChannelTools();
        this.wallet = new WalletTools();
        this.msig = new MultisigTools();
        this.utils = Utils;
    }
}
