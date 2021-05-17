import { BigNumber } from "bignumber.js";

export type Address = string;

export type PrivateKey = string;

export type TokenAmount = BigNumber;

export type Nonce = number;

export type MsgParams = string;

export type CID = string | object;

export type Network = "mainnet" | "testnet";

export type SignedVoucherBase64 = string;

export type VoucherBase64 = string;

export type HashedSecret = string;

export enum ProtocolIndicator {
    ID,
    SECP256K1,
    ACTOR,
    BLS,
}

export enum CodeCID {
    PaymentChannel = "fil/4/paymentchannel",
    Multisig = "fil/4/multisig",
}

export enum INIT_ACTOR {
    mainnet = "f01",
    testnet = "t01",
}

export enum InitMethod {
    None,
    Constructor,
    Exec,
}

export enum PaymentChannelMethod {
    None,
    Construtor,
    UpdateChannelState,
    Settle,
    Collect,
}

export enum MultisigMethod {
    None,
    Constructor,
    Propose,
    Approve,
    Cancel,
    AddSigner,
    RemoveSigner,
    SwapSigner,
    ChangeNumApprovalsThreshhold,
}

export class Message {
    Version?: number;
    To!: Address;
    From!: Address;
    Nonce!: Nonce;
    Value!: BigNumber;
    GasLimit!: number;
    GasFeeCap!: BigNumber;
    GasPremium: BigNumber;
    Method!: number;
    Params!: string;
}

export type Voucher = string;

export class VoucherSpec {}

export type FilecoinNetwork = "f" | "t";

export interface Signature {
    Data: string;
    Type: number;
}

export interface SignedMessage {
    Message: Message;
    Signature: Signature;
}

// export class SignedVoucher {
//   /**
//    * Address of the payment channel this signed voucher is valid for
//    */
//   ChannelAddr!: string
//   /**
//    * Min epoch before which the voucher cannot be redeemed
//    */
//   TimeLockMin!: ChainEpoch
//   /**
//    * Max epoch beyond which the voucher cannot be redeemed
//    * TimeLockMax set to 0 means no timeout
//    */
//   TimeLockMax!: ChainEpoch
//   /**
//    * (optional) The SecretPreImage is used by `To` to validate
//    */
//   SecretPreimage?: []
//   /**
//    * (optional) Extra can be specified by `From` to add a verification method to the voucher
//    */
//   Extra?: ModVerifyParams
//   /**
//    * Specifies which lane the Voucher merges into (will be created if does not exist)
//    */
//   Lane!: number
//   /**
//    * Nonce is set by `From` to prevent redemption of stale vouchers on a lane
//    */
//   Nonce!: number
//   /**
//    * Amount voucher can be redeemed for
//    */
//   Amount!: string
//   /**
//    * (optional) MinSettleHeight can extend channel MinSettleHeight if needed
//    */
//   MinSettleHeight?: ChainEpoch

//   /**
//    * (optional) Set of lanes to be merged into `Lane`
//    */
//   Merges?: Merge[]

//   /**
//    * Sender's signature over the voucher
//    */
//   Signature!: Signature
// }
