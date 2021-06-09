# filecoin-js-signer

Filecoin signing library and RPC client.

## Usage

How to use the library can be found in the [reference guide](#).

## Filecoin Signer
Collection of methods to create and sign messages to send funds and interact with Filecoin's built-in actors.

### createPaymentChannelMsg
Create create the unsigned message required to create a payment channel.


```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const from = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const to = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const amount = new BigNumber(1e18)
const nonce = 0
const network = 'mainnet'

const unsignedMessage = await filecoin_signer.paych.createPaymentChannelMsg(from, to, amount, nonce, network)

console.log(unsignedMessage)
//{
//  From: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//  To: 'f01',
//  Nonce: 0,
//  Value: BigNumber { s: 1, e: 19, c: [ 100000 ] },
//  GasLimit: 10000000,
//  GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//  GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//  Method: 2,
//  Params: 'gtgqWBkAAVUAFGZpbC80L3BheW1lbnRjaGFubmVsWC2CVQGzTpYVOoUDkpp7RK/KycU5SJHZRFUBs06WFTqFA5Kae0SvysnFOUiR2UQ='
//}
```

### createVoucher
Create an unsigned voucher to enable the voucher recipient to redeem funds from the payment channel.

```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedVoucher = await filecoin_signer.paych.createVoucher(
    paymentChannelAddress, // paymentChannelAddress
    0, // timeLockMin
    0, // timeLockMax
    '', // secretHash
    new BigNumber(1e18), // amount
    0, // lane
    0, // voucherNonce
    0, // minSettleHeight
)

console.log(unsignedVoucher)
// i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAID2
```

### signVoucher
Sign a voucher with private key.

```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedVoucher = 'i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAID2'

const signedVoucher = await filecoin_signer.paych.signVoucher(unsignedVoucher, privateKey)
console.log(signedVoucher)
// i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAIBYQgE/WULVPYSydr0CsaqHkEaH9FYawRtgDOjtpubcWGdpul9lQYFsr6hOoK8anmylhGwB9p3BbGJVaTmAt2z2+srzAQ==
```

### verifyVoucherSignature
Verify the signature of a voucher

```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const signedVoucher = 'i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAIBYQgE/WULVPYSydr0CsaqHkEaH9FYawRtgDOjtpubcWGdpul9lQYFsr6hOoK8anmylhGwB9p3BbGJVaTmAt2z2+srzAQ=='
const signerAddress = 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa'

const signatureIsValid = await filecoin_signer.paych.verifyVoucherSignature(unsignedVoucher, signerAddress)
console.log(signatureIsValid)
// true
```

### updatePaymentChannelMsg
Create the unsigned message required to redeem a voucher from a payment channel

```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const paymentChannelAddress = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const from = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const signedVoucher = 'i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAIBYQgE/WULVPYSydr0CsaqHkEaH9FYawRtgDOjtpubcWGdpul9lQYFsr6hOoK8anmylhGwB9p3BbGJVaTmAt2z2+srzAQ=='
const secret = ''
const nonce = 0

const redeemVoucherMsg = await filecoin_signer.paych.updatePaymentChannelMsg(
    paymentChannelAddress,
    from,
    signedVoucher,
    secret,
    nonce,
)

console.log(redeemVoucherMsg)

// {
//     From: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//     To: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasLimit: 5000000,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 2,
//     Params: 'gotVAbNOlhU6hQOSmntEr8rJxTlIkdlEAABA9gAASQAN4Lazp2QAAACAWEIBP1lC1T2Esna9ArGqh5BGh/RWGsEbYAzo7abm3FhnabpfZUGBbK+oTqCvGp5spYRsAfadwWxiVWk5gLds9vrK8wFA'
// }
```

### settlePaymentChannelMsg
Create the unsigned message required to start the settling process of a payment channel.

```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const paymentChannelAddress = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const from = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const nonce = 0

const settleMsg = await filecoin_signer.paych.settlePaymentChannelMsg(
    paymentChannelAddress,
    from,
    nonce,
)

console.log(settleMsg)

// {
//     From: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//     To: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasLimit: 0,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 3,
//     Params: ''
// }
```

### collectPaymentChannelMsg
Create the unsigned message required to collect the funds in a payment channel, once the settling process has ended.

```javascript
import { FilecoinSigner } from '@blits-labs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const paymentChannelAddress = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const from = 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y'
const nonce = 0

const collectMsg = await filecoin_signer.paych.collectPaymentChannelMsg(
    paymentChannelAddress,
    from,
    nonce,
)

console.log(collectMsg)

// {
//     From: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//     To: 'f1wnhjmfj2qubzfgt3isx4vsofhfejdwkeqgqzr4y',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasLimit: 0,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 4,
//     Params: ''
// }
```


## Develop

How to install, test and contribute can be found [here](docs/DEVELOP.md).

## Credits and references

1. [filecoin-signing-tools](https://github.com/Zondax/filecoin-signing-tools)
2. [filecoin.js](https://github.com/filecoin-shipyard/filecoin.js)
