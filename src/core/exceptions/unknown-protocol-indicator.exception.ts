export class UnknownProtocolIndicator extends Error {
    constructor() {
        super("Unknown protocol indicator byte.");
        Object.setPrototypeOf(this, UnknownProtocolIndicator.prototype);
    }
}
