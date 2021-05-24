export class ProtocolNotSupported extends Error {
    constructor(public protocolName: string) {
        super(`${protocolName} protocol not supported.`);
        Object.setPrototypeOf(this, ProtocolNotSupported.prototype);
    }
}
