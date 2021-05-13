import { Network, PrivateKey } from "../../core/types/types";
import { KeyPair, keyPairFromPrivateKey } from "@nodefactory/filecoin-address";
import { generateMnemonic } from "bip39";

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
}
