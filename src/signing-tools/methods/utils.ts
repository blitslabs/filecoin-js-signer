/*************************************************
 * Title: filecoin-signing-tools
 * Author: Zondax
 * Availability: https://github.com/Zondax/filecoin-signing-tools/blob/master/signer-npm/js/src/utils/index.js
 *************************************************/

import blake from "blakejs";
import leb from "leb128";
import base32Decode from "base32-decode";
import base32Encode from "base32-encode";
import BN from "bn.js";
import assert from "assert";
import secp256k1 from "secp256k1";
import { Address, PrivateKey, ProtocolIndicator, FilecoinNetwork } from "../../core/types/types";
import { publicKeyToAddress } from "@nodefactory/filecoin-address";
import {
    InvalidPayloadLength,
    ProtocolNotSupported,
    UnknownProtocolIndicator,
    InvalidChecksumAddress,
} from "../../core/exceptions/errors";

const CID_PREFIX = Buffer.from([0x01, 0x71, 0xa0, 0xe4, 0x02, 0x20]);

export function createHash(message): Buffer {
    const blakeCtx = blake.blake2bInit(32);
    blake.blake2bUpdate(blakeCtx, message);
    return Buffer.from(blake.blake2bFinal(blakeCtx));
}

function getCID(message) {
    const blakeCtx = blake.blake2bInit(32);
    blake.blake2bUpdate(blakeCtx, message);
    const hash = Buffer.from(blake.blake2bFinal(blakeCtx));
    return Buffer.concat([CID_PREFIX, hash]);
}

export function getDigest(message) {
    // digest = blake2-256( prefix + blake2b-256(tx) )

    const blakeCtx = blake.blake2bInit(32);
    blake.blake2bUpdate(blakeCtx, getCID(message));
    return Buffer.from(blake.blake2bFinal(blakeCtx));
}

export function addressAsBytes(address: Address) {
    let address_decoded, payload, checksum;
    const protocolIndicator = address[1];
    const protocolIndicatorByte = `0${protocolIndicator}`;

    switch (Number(protocolIndicator)) {
        case ProtocolIndicator.ID:
            if (address.length > 18) {
                throw new InvalidPayloadLength();
            }
            return Buffer.concat([
                Buffer.from(protocolIndicatorByte, "hex"),
                Buffer.from(leb.unsigned.encode(address.substr(2))),
            ]);
        case ProtocolIndicator.SECP256K1:
            address_decoded = base32Decode(address.slice(2).toUpperCase(), "RFC4648");

            payload = address_decoded.slice(0, -4);
            checksum = Buffer.from(address_decoded.slice(-4));

            if (payload.byteLength !== 20) {
                throw new InvalidPayloadLength();
            }
            break;
        case ProtocolIndicator.ACTOR:
            address_decoded = base32Decode(address.slice(2).toUpperCase(), "RFC4648");

            payload = address_decoded.slice(0, -4);
            checksum = Buffer.from(address_decoded.slice(-4));

            if (payload.byteLength !== 20) {
                throw new InvalidPayloadLength();
            }
            break;
        case ProtocolIndicator.BLS:
            throw new ProtocolNotSupported("BLS");
        default:
            throw new UnknownProtocolIndicator();
    }

    const bytes_address = Buffer.concat([Buffer.from(protocolIndicatorByte, "hex"), Buffer.from(payload)]);

    if (getChecksum(bytes_address).toString("hex") !== checksum.toString("hex")) {
        throw new InvalidChecksumAddress();
    }

    return bytes_address;
}

export function bytesToAddress(payload, testnet) {
    const protocolIndicator = payload[0];

    switch (Number(protocolIndicator)) {
        case ProtocolIndicator.ID:
            // if (payload.length > 16) { throw new InvalidPayloadLength(); };
            throw new ProtocolNotSupported("ID");
        case ProtocolIndicator.SECP256K1:
            if (payload.slice(1).length !== 20) {
                throw new InvalidPayloadLength();
            }
            break;
        case ProtocolIndicator.ACTOR:
            if (payload.slice(1).length !== 20) {
                throw new InvalidPayloadLength();
            }
            break;
        case ProtocolIndicator.BLS:
            throw new ProtocolNotSupported("BLS");
        default:
            throw new UnknownProtocolIndicator();
    }

    const checksum = getChecksum(payload);

    let prefix = "f";
    if (testnet) {
        prefix = "t";
    }

    prefix += protocolIndicator;

    return (
        prefix +
        base32Encode(Buffer.concat([payload.slice(1), checksum]), "RFC4648", {
            padding: false,
        }).toLowerCase()
    );
}

export function getChecksum(payload) {
    const blakeCtx = blake.blake2bInit(4);
    blake.blake2bUpdate(blakeCtx, payload);
    return Buffer.from(blake.blake2bFinal(blakeCtx));
}

export function serializeBigNum(value: string) {
    if (value == "0") {
        return Buffer.from("");
    }
    const valueBigInt = new BN(value, 10);
    const valueBuffer = valueBigInt.toArrayLike(Buffer, "be", valueBigInt.byteLength());
    return Buffer.concat([Buffer.from("00", "hex"), valueBuffer]);
}

export function tryToPrivateKeyBuffer(privateKey) {
    if (typeof privateKey === "string") {
        // We should have a padding!
        if (privateKey.slice(-1) === "=") {
            privateKey = Buffer.from(privateKey, "base64");
        } else {
            privateKey = Buffer.from(privateKey, "hex");
        }
    }

    assert(privateKey.length === 32);

    return privateKey;
}

/*************************************************
 * Title: filecoin-js-signer
 * Author: Blits Labs
 *************************************************/

/**
 * @notice Sign any kind of message with private key
 * @param message
 * @param privateKey
 * @returns Signature hex
 */
export function signMessage(message: any, privateKey: PrivateKey): string {
    // Get Private Key as Buffer
    const privateKeyBuffer = tryToPrivateKeyBuffer(privateKey);

    // Get Message Digest
    const messageDigest = getDigest(message);

    // Sign message
    const signature = secp256k1.ecdsaSign(messageDigest, privateKeyBuffer);
    const signatureResult = Buffer.concat([Buffer.from(signature.signature), Buffer.from([signature.recid])]);

    return Buffer.from(signatureResult).toString("hex");
}

/**
 * @notice Verify that `signerAddress` signed a given message
 * @param message
 * @param signature
 * @param signerAddress
 * @returns
 */
export function verifySignature(message: string, signature: string, signerAddress: Address): Boolean {
    // Get Signature as Buffer
    const signatureBuffer = Buffer.from(signature, "hex");

    // Get Message Digest
    const messageDigest = getDigest(message);

    // Recover public key
    const publicKey = secp256k1.ecdsaRecover(signatureBuffer.slice(0, -1), signatureBuffer[64], messageDigest, false);

    // Convert public key to FIL address
    const network = signerAddress[0] as FilecoinNetwork;

    // Compare recovered address to signer address
    if (publicKeyToAddress(publicKey, network) !== signerAddress) {
        throw new Error("Recovered address does not match the signer address");
    }

    // Verify recovered signature
    return secp256k1.ecdsaVerify(signatureBuffer.slice(0, -1), messageDigest, publicKey);
}
