import { Address, CID, Network, PrivateKey, TokenAmount } from "../../core/types/types";
import { KeyPair } from "@nodefactory/filecoin-address";
import { Tx } from "./tx";
import BigNumber from "bignumber.js";
import { FilecoinSigner } from "../../signing-tools";

export class Wallet {
    constructor(private readonly tx: Tx, private readonly signingTools: FilecoinSigner) {}

    /**
     * @notice Recovers key pair from private key
     * @param privateKey hex or base64 encoded private key
     * @param network mainnet or testnet
     * @returns Key pair
     */
    public keyRecover(privateKey: PrivateKey, network: Network = "mainnet"): KeyPair {
        return this.signingTools.wallet.keyRecover(privateKey, network);
    }

    /**
     * @notice Generates a mnemonic
     * @param strength Strength of the mnemonic
     * @returns Mnemonic
     */
    public generateMnemonic(strength = 128): string {
        return this.signingTools.wallet.generateMnemonic(strength);
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
