import { Network, PrivateKey } from "../../core/types/types";
import { KeyPair, keyPairFromPrivateKey } from "@nodefactory/filecoin-address";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32";
import { keyPairFromSeed } from "@nodefactory/filecoin-address";

export class WalletTools {
    /**
     * @notice Recovers key pair from private key
     * @param privateKey hex or base64 encoded private key
     * @param network mainnet or testnet
     * @returns Key pair
     */
    public keyRecover(privateKey: PrivateKey, network: Network = "mainnet"): KeyPair {
        if (privateKey.slice(-1) === "=") {
            privateKey = Buffer.from(privateKey, "base64").toString("hex");
        }

        return keyPairFromPrivateKey(privateKey, network === "mainnet" ? "f" : "t");
    }

    /**
     * @notice Generates a mnemonic
     * @param strength Strength of the mnemonic
     * @returns Mnemonic
     */
    public generateMnemonic(strength = 128): string {
        return generateMnemonic(strength);
    }

    /**
     * @notice Get key pair from mnemonic
     * @param mnemonic The mnemonic to derive the key from
     * @param path Key derivation path
     * @param network mainnet or testnet
     * @returns Key pair
     */
    public keyDerive(mnemonic: string, path: string, network: Network = "mainnet"): KeyPair {
        // Get seed from mnemonic
        const seed = mnemonicToSeedSync(mnemonic);
        return this.keyDeriveFromSeed(seed, path, network);
    }

    /**
     * @notice Get key pair from seed
     * @param seed The seed to derive the key from
     * @param path Key derivation path
     * @param network mainnet or testnet
     * @returns Key pair
     */
    public keyDeriveFromSeed(seed: Buffer, path: string, network: Network = "mainnet"): KeyPair {
        // Master Key
        const masterKey = fromSeed(seed);

        // Derive Child Key
        const childKey = masterKey.derivePath(path);

        // Recover Keys from Private Key
        return this.keyRecover(Buffer.from(childKey.privateKey).toString("hex"), network);
    }
}
