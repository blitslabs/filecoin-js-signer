export class InvalidPayloadLength extends Error {
    constructor() {
        super("Invalid payload length.");
        Object.setPrototypeOf(this, InvalidPayloadLength.prototype);
    }
}
