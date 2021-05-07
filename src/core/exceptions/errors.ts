export class InvalidPayloadLength extends Error {
  constructor() {
    super('Invalid payload length.')
    Object.setPrototypeOf(this, InvalidPayloadLength.prototype)
  }
}

export class ProtocolNotSupported extends Error {
  constructor(public protocolName: string) {
    super(`${protocolName} protocol not supported.`)
    Object.setPrototypeOf(this, ProtocolNotSupported.prototype)
  }
}

export class UnknownProtocolIndicator extends Error {
    constructor() {
        super('Unknown protocol indicator byte.')
        Object.setPrototypeOf(this, UnknownProtocolIndicator.prototype)
    }
}

export class InvalidChecksumAddress extends Error {
    constructor() {
        super('Invalid address (checksum not matching the payload).')
        Object.setPrototypeOf(this, InvalidChecksumAddress.prototype)
    }
}

export class InvalidVoucherSignature extends Error {
  constructor() {
    super('Invalid voucher signature.')
    Object.setPrototypeOf(this, InvalidVoucherSignature.prototype)
  }
}