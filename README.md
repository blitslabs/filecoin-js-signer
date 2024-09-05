# filecoin-js-signer

![Project Status](https://img.shields.io/badge/status-No%20longer%20maintained-red?style=for-the-badge)
[![GitHub last commit](https://img.shields.io/github/last-commit/blitslabs/filecoin-js-signer?style=for-the-badge)](https://github.com/data-preservation-programs/spade/graphs/commit-activity)

## Status

Unfortunately this project has not seen any meaningful activities since November 2020 and is deemed unmaintained. If you are a user of this project and would like to become a maintainer, please reach out to [@smagdali](https://github.com/smagdali).

---

Filecoin signing library and RPC client in pure Typescript / Javascript with the necessary methods to create, sign and broadcast messages to send FIL, and interact with Filecoin's built-in actors (like Payment Channel and Multisig).

## Motivation
This library was created as part of the Filecoin Loans Grant awarded by the Filecoin Foundation. At the time of its creation (April 2021), there were no functional signing libraries written in pure Javascript or that had a complete implementation of the Payment Channel actor's methods (i.e. passing a hash/secret to create and redeem vouchers, necessary to create Atomic Swaps / Atomic Loans). A pure Javascript implementation of these methods can also facilitate, or simplify, the usage from React Native or web applications that interact with the Filecoin network.

## Installing


```bash
npm install --save @blitslabs/filecoin-js-signer
```


## API Reference

Go to [reference guide](https://app.gitbook.com/@blitslabs/s/filecoin-loans/tools/filecoin-js-signer/api-reference).

## Filecoin Signer
Collection of methods to create and sign messages to send funds and interact with Filecoin's built-in actors (Payment Channel & Multisig).

### wallet.generateMnemonic
Generate a seed phrase (mnemonic).

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const strength = 128 // 128 => 12 words | 256 => 24 words
const mnemonic = await filecoin_signer.wallet.generateMnemonic(strength)

console.log(unsignedMessage)
// floor electric fitness someone escape achieve mixture alley obey main funny kingdom
```

### wallet.keyDerive
Derive (public/private) keys from a mnemonic.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const strength = 128 // 128 => 12 words | 256 => 24 words
const mnemonic = await filecoin_signer.wallet.generateMnemonic(strength)
const i = 0
const network = 'testnet'

const keys = await filecoin_signer.wallet.keyDerive(mnemonic, `m/44'/461'/0'/0/${i}`, network)
console.log(keys)

// KeyPair {
//     _publicKey: '049333be94a4dfe65e7b2142870186f7deb9e82cf4c1790c55ef6bfa767ecd187fb2615a203cf61d76a24029f118e74705cc7c6304e4808e4c87a608a7dadedc41',
//     _privateKey: '6f093e7932838e7d5c0b01a3c6b7be1c4d96afff9431af9b53d42cc2d0bf3e3c',
//     _address: 't124h7myx7vyydjrwt4t456jlctx6ssbqj6wccsui'
// }
```

### wallet.keyRecover
Recover (public/private) keys from a private key. 

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const privateKey = '6f093e7932838e7d5c0b01a3c6b7be1c4d96afff9431af9b53d42cc2d0bf3e3c'
const keys = await filecoin_signer.wallet.keyRecover(privateKey, 'testnet')
console.log(keys)

// KeyPair {
//     _publicKey: '049333be94a4dfe65e7b2142870186f7deb9e82cf4c1790c55ef6bfa767ecd187fb2615a203cf61d76a24029f118e74705cc7c6304e4808e4c87a608a7dadedc41',
//     _privateKey: '6f093e7932838e7d5c0b01a3c6b7be1c4d96afff9431af9b53d42cc2d0bf3e3c',
//     _address: 't124h7myx7vyydjrwt4t456jlctx6ssbqj6wccsui'
// }
```

### paych.createPaymentChannelMsg
Create an unsigned message to create a payment channel.


```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
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

### paych.createVoucher
Create an unsigned voucher to enable the voucher recipient to redeem funds from the payment channel.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
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

### paych.signVoucher
Sign a voucher with private key.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedVoucher = 'i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAID2'

const signedVoucher = await filecoin_signer.paych.signVoucher(unsignedVoucher, privateKey)
console.log(signedVoucher)
// i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAIBYQgE/WULVPYSydr0CsaqHkEaH9FYawRtgDOjtpubcWGdpul9lQYFsr6hOoK8anmylhGwB9p3BbGJVaTmAt2z2+srzAQ==
```

### paych.verifyVoucherSignature
Verify the signature of a voucher

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const signedVoucher = 'i1UBs06WFTqFA5Kae0SvysnFOUiR2UQAAED2AABJAA3gtrOnZAAAAIBYQgE/WULVPYSydr0CsaqHkEaH9FYawRtgDOjtpubcWGdpul9lQYFsr6hOoK8anmylhGwB9p3BbGJVaTmAt2z2+srzAQ=='
const signerAddress = 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa'

const signatureIsValid = await filecoin_signer.paych.verifyVoucherSignature(unsignedVoucher, signerAddress)
console.log(signatureIsValid)
// true
```

### paych.updatePaymentChannelMsg
Create the unsigned message required to redeem a voucher from a payment channel

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
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

### paych.settlePaymentChannelMsg
Create the unsigned message required to start the settling process of a payment channel.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
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

### paych.collectPaymentChannelMsg
Create the unsigned message required to collect the funds in a payment channel, once the settling process has ended.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
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

### msig.createMultisigMsg
Returns an unsigned message to create multi-signature wallet

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedMessage = await filecoin_signer.msig.createMultisigMsg(
    from,
    addresses,
    amount,
    requiredNumberOfApprovals,
    nonce,
    unlockDuration,
    startEpoch,
)

// {
//     From: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     To: 'f01',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 19, c: [ 100000 ] },
//     GasLimit: 0,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 2,
//     Params: 'gtgqUwABVQAOZmlsLzQvbXVsdGlzaWdYMYSCVQG5g/24W5bkRpi9MeoepzPHSzcpw1UBuYP9uFuW5EaYvTHqHqczx0s3KcMCAAA='
// }
```

### msig.proposeMultisigMsg
Returns an unsigned message to propose a multisig message

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedMessage = await filecoin_signer.msig.proposeMultisigMsg(
    multisigAddress,        
    from,
    to,
    amount,        
    nonce,        
)

// {
//     From: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     To: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasLimit: 0,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 2,
//     Params: 'hFUBuYP9uFuW5EaYvTHqHqczx0s3KcNJAIrHIwSJ6AAAAEA='
// }
```

### msig.approveMultisigMsg
Returns an unsigned message to approve a multisig message

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedMessage = await filecoin_signer.msig.approveMultisigMsg(
    multisigAddress,
    messageId,
    requester,
    from,
    to,
    amount,        
    nonce,        
)

// {
//     From: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     To: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasLimit: 0,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 3,
//     Params: 'ggBYIM39f3E1eS5YseC0v+YNCsL99ieU5FWmS1RZgRcDnzBB'
// }
```

### msig.cancelMultisigMsg
Returns an unsigned message to cancel a multisig message

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedMessage = await filecoin_signer.msig.cancelMultisigMsg(
    multisigAddress,        
    messageId,
    requester,
    from,
    to,
    amount,        
    nonce,        
)

// {
//     From: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     To: 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa',
//     Nonce: 0,
//     Value: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasLimit: 0,
//     GasFeeCap: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     GasPremium: BigNumber { s: 1, e: 0, c: [ 0 ] },
//     Method: 4,
//     Params: 'ggBYIM39f3E1eS5YseC0v+YNCsL99ieU5FWmS1RZgRcDnzBB'
// }
```

### tx.transactionSignLotus
Sign an unsigned message with a given private key

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const unsignedMessage = await filecoin_signer.paych.createPaymentChannelMsg(
    from, to, amount, nonce, network
)   

const signedMessage = await filecoin_signer.tx.transactionSignLotus(unsignedMessage, privateKey)
console.log(signedMessage)

// {"Message":{"From":"t1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa","GasLimit":10000000,"GasFeeCap":"0","GasPremium":"0","Method":2,"Nonce":0,"Params":"gtgqWBkAAVUAFGZpbC80L3BheW1lbnRjaGFubmVsWC2CVQG5g/24W5bkRpi9MeoepzPHSzcpw1UBuYP9uFuW5EaYvTHqHqczx0s3KcM=","To":"f01","Value":"10000000000000000000"},"Signature":{"Data":"jqoMlz82/zUTAWkuzvylRNJ8e7qjDtla35CZA8cCU0F68M366lUORzIBrcKnB3FMyHqXptOicE+0GxDe/V1vDgA=","Type":1}}
```

### tx.transactionVerifyLotus
Verify the signature of a signed message.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const signatureIsValid = await filecoin_signer.tx.transactionVerifyLotus(signedMessage)

console.log(signatureIsValid)
// true
```

### utils.signMessage
Utilitary function to sign a message with a given private key.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const message = 'message'
const privateKey = '6f093e7932838e7d5c0b01a3c6b7be1c4d96afff9431af9b53d42cc2d0bf3e3c'
const signedMessage = await filecoin_signer.utils.signMessage(message, privateKey)
console.log(signedMessage)

// a18a1c3f4fd55fd1842746e40dea9d26e7a24511c3f809b20b6d2254e607c8e9562d82f02ba7d72321be64049b8ee10141c7b86793bf686634a331fef75f54f800
```

### utils.verifySignature
Utilitary function to verify a signature.

```javascript
import { FilecoinSigner } from '@blitslabs/filecoin-signing-tools'
const filecoin_signer = new FilecoinSigner()

const message = 'message'
const privateKey = '6f093e7932838e7d5c0b01a3c6b7be1c4d96afff9431af9b53d42cc2d0bf3e3c'
const signer = 't124h7myx7vyydjrwt4t456jlctx6ssbqj6wccsui'
const signature = await filecoin_signer.utils.signMessage(message, privateKey)

const signatureIsValid = await filecoin_signer.utils.verifySignature(message, signature, signer)
console.log(signatureIsValid)

// true
```

<br />

## Filecoin Client
Collection of methods to create, sign and broadcast messages to send funds and interact with Filecoin's built-in actors (Payment Channel & Multisig).

*The difference with FilecoinSigner is that FilecoinClient broadcasts the messages to the network.

### paych.createPaymentChannel
Create, sign and broadcast a message to create a payment channel.
```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const from = 't124h7myx7vyydjrwt4t456jlctx6ssbqj6wccsui'
const to = 't1xgb73oc3s3sengf5ghvb5jzty5ftokodkibtmfa'
const amount = new BigNumber(1e18)    
const privateKey = '6f093e7932838e7d5c0b01a3c6b7be1c4d96afff9431af9b53d42cc2d0bf3e3c'
const network = 'testnet'
const waitMsg = false // false => return CID || true => wait for tx to confirm and return tx details

const response = await filecoin_client.paych.createPaymentChannel(from, to, amount, privateKey, network, waitMsg)
console.log(response)
// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### paych.updatePaymentChannel
Create, sign and broadcast a message to redeem a payment channel's  voucher.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.paych.updatePaymentChannel(
    paymentChannelAddress,
    from,
    signedVoucher,
    secret,
    privateKey,        
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### paych.settlePaymentChannel
Create, sign and broadcast a message to settle a payment channel.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.paych.settlePaymentChannel(
    paymentChannelAddress,
    from,        
    privateKey,        
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### paych.collectPaymentChannel
Create, sign and broadcast a message to collect a payment channel.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.paych.collectPaymentChannel(
    paymentChannelAddress,
    from,        
    privateKey,        
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### msig.createMultisig
Create, sign and broadcast a message to create a multisig.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.msig.createMultisig(
    from,
    addresses,
    amount,
    requiredNumberOfApprovals,
    nonce,
    unlockDuration,
    startEpoch,
    "fil/4/multisig",
    privateKey,
    network,
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### msig.proposeMultisig
Create, sign and broadcast a message to propose a multisig message.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.msig.proposeMultisig(
    multisigAddress,        
    from,
    to,
    amount,        
    nonce,
    privateKey,
    network,
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### msig.approveMultisig
Create, sign and broadcast a message to approve a multisig message.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.msig.approveMultisig(
    multisigAddress,
    messageId,
    requester,
    from,
    to,
    amount,
    nonce,
    privateKey,
    network,
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### msig.cancelMultisig
Create, sign and broadcast a message to approve a multisig message.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.msig.cancelMultisig(
    multisigAddress,
    messageId,
    requester,
    from,
    to,
    amount,
    nonce,
    privateKey,
    network,
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### tx.send
Create, sign and broadcast a message send FIL.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.tx.send(
    to,
    amount,
    gasLimit,
    privateKey,
    network,
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

### tx.sendMessage
Sign and broadcast a custome message.

```javascript
import { FilecoinClient } from '@blitslabs/filecoin-signing-tools'
const endpoint = 'https://calibration.node.glif.io'
const token = ''
const filecoin_client = new FilecoinClient(endpoint, token)

const response = await filecoin_client.tx.sendMessage(
    message,
    privateKey,
    updateMsgNonce,
    waitMsg
)
console.log(response)

// {
//   '/': 'bafy2bzacec3byj5vt5jlxssuv5idccgsag526j4x272vmm4nsqcix5luq4zrs'
// }
```

## Develop

How to install, test and contribute can be found [here](docs/DEVELOP.md).

## References

1. [filecoin-signing-tools](https://github.com/Zondax/filecoin-signing-tools)
2. [filecoin.js](https://github.com/filecoin-shipyard/filecoin.js)
