import { Address, CID, Network, PrivateKey, TokenAmount } from "../core/types/types";
import { KeyPair, keyPairFromPrivateKey } from "@nodefactory/filecoin-address";
import { Tx } from "./tx";
import BigNumber from "bignumber.js";
import { generateMnemonic } from "bip39";

export class Wallet {
    constructor(private readonly tx: Tx) {}

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
     * @notice Gets the balance of the account
     * @param address FIL address of the account
     * @returns The balance of the account
     */
    public async getBalance(address: Address): Promise<TokenAmount> {
        const balance = await this.tx.clientProvider.wallet.balance(address);
        const d = new BigNumber(10).pow(18);
        return new BigNumber(balance).multipliedBy(d);
    }

    /**
     * @notice Generates 12 words as a mnemonic
     * @returns 12 words separated by an space
     */
    public generateMnemonic(): string {
        return generateMnemonic(128);
    }

    /**
     * @notice Transfers tokens to another account
     * @param to Receiver's account
     * @param amount Amount to transfer
     * @param gasLimit Gas limit value
     * @param privateKey Private key of the sender
     * @param network mainnet or testnet
     * @returns The Transaction CID
     */
    public async transfer(
        to: Address,
        amount: TokenAmount,
        gasLimit: number,
        privateKey: PrivateKey,
        network: Network = "mainnet"
    ): Promise<CID> {
        return this.tx.send(to, amount, gasLimit, privateKey, network);
    }
}
