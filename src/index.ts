
import {Tx} from './transactions/tx'
import {Wallet} from './wallet/wallet'
import * as Utils from './utils/utils'
import { HttpJsonRpcConnector, LotusClient } from 'filecoin.js'
import {PaymentChannel} from "./payment-channels/payment-channel";

export class FilecoinSigner {
  public paych: PaymentChannel
  public tx: Tx
  public wallet: Wallet
  public lotus: LotusClient
  public utils: any

  constructor(rpcUrl?: string, token?: string) {
    const connector = new HttpJsonRpcConnector({ url: rpcUrl, token })
    this.lotus = new LotusClient(connector)
    this.paych = new PaymentChannel()
    this.tx = new Tx(this.lotus)
    this.wallet = new Wallet()
    this.utils = Utils
  }
}
