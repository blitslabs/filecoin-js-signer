import BigNumber from 'bignumber.js'
import PaymentChannel from './PaymentChannel'
import Tx from './Tx'
import Wallet from './Wallet'
import * as Utils from './Utils'
import { HttpJsonRpcConnector, LotusClient } from 'filecoin.js'

export default class FilecoinSigner {
  public paych: PaymentChannel
  public tx: Tx
  public wallet: Wallet
  public lotus: LotusClient
  public utils: any

  constructor(endpoint?: string, token?: string) {
    const connector = new HttpJsonRpcConnector({ url: endpoint, token })
    this.lotus = new LotusClient(connector)
    this.paych = new PaymentChannel()
    this.tx = new Tx(this.lotus)
    this.wallet = new Wallet()
    this.utils = Utils
  }
}
