export class InvalidChecksumAddress extends Error {
    constructor() {
        super("Invalid address (checksum not matching the payload).");
        Object.setPrototypeOf(this, InvalidChecksumAddress.prototype);
    }
}
