export class InvalidVoucherSignature extends Error {
    constructor() {
        super("Invalid voucher signature.");
        Object.setPrototypeOf(this, InvalidVoucherSignature.prototype);
    }
}
