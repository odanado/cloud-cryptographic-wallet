import ProviderEngine from "web3-provider-engine";
import HookedSubprovider, {
  TxData,
  MsgParams,
} from "web3-provider-engine/subproviders/hooked-wallet";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
import { Transaction, TransactionOptions } from "ethereumjs-tx";
import Common from "ethereumjs-common";
import * as EthUtil from "ethereumjs-util";

import {
  Provider,
  JSONRPCRequestPayload,
  JSONRPCErrorCallback,
} from "ethereum-protocol";

import { KmsSigner } from "./signer/kms-signer";
import { Ethereum } from "./ethereum";

export interface KmsOptions {
  region: string;
  keyIds: string[];
  credential?: AwsCredential;
}

export interface AwsCredential {
  accessKeyId: string;
  secretAccessKey: string;
}

export type Network = "mainnet" | "ropsten" | "rinkeby" | "kovan";
export interface NetworkOptions {
  chainName: string;
  chainId: number;
  networkId: number;
}

export class KmsProvider implements Provider {
  private readonly engine: ProviderEngine;
  private readonly signers: KmsSigner[];
  private cacheAccounts: string[] = [];
  private readonly networkOrNetworkOptions?: Network | NetworkOptions;
  private ethereum: Ethereum;

  public constructor(
    endpoint: string,
    kmsOptions: KmsOptions,
    networkOrNetworkOptions?: Network | NetworkOptions
  ) {
    this.engine = new ProviderEngine();
    this.signers = kmsOptions.keyIds.map(
      (keyId) => new KmsSigner(kmsOptions.region, keyId, kmsOptions.credential)
    );
    this.networkOrNetworkOptions = networkOrNetworkOptions;
    this.ethereum = new Ethereum(endpoint);

    this.engine.addProvider(
      new HookedSubprovider({
        getAccounts: (callback) => {
          this.getAccounts()
            .then((accounts) => {
              callback(null, accounts);
            })
            .catch((err) => {
              callback(err);
            });
        },
        signTransaction: (txData, callback) => {
          this.signTransaction(txData)
            .then((rawTx) => {
              callback(null, rawTx);
            })
            .catch((err) => callback(err));
        },
        signMessage: (msgParams, callback) => {
          this.signMessage(msgParams)
            .then((signature) => {
              callback(null, signature);
            })
            .catch((err) => callback(err));
        },
      })
    );

    this.engine.addProvider(new RpcSubprovider({ rpcUrl: endpoint }));

    this.engine.start();
  }

  public async getAccounts(): Promise<string[]> {
    if (this.cacheAccounts.length !== 0) return this.cacheAccounts;

    const addresses = await Promise.all(
      this.signers.map((signer) => signer.getAddress())
    );
    this.cacheAccounts = addresses.map((address) => `0x${address.toString()}`);
    return this.cacheAccounts;
  }

  public async signTransaction(txData: TxData) {
    const from = txData.from;
    const signer = this.resolveSigner(from);

    if (!signer) {
      throw new Error(`Account not found: ${from}`);
    }

    const tx = await this.createTransaction(txData);
    const digest = tx.hash(false);

    const signature = await signer.sign(digest);

    // TODO: move to signature.ts
    const vStr = (signature.v + tx.getChainId() * 2 + 8).toString(16);
    const length = vStr.length + (vStr.length % 2);

    const v = Buffer.from(vStr.padStart(length, "0"), "hex");

    tx.r = signature.r;
    tx.s = signature.s;
    tx.v = v;

    const rawTx = `0x${tx.serialize().toString("hex")}`;

    return rawTx;
  }

  public async signMessage(msgParams: MsgParams) {
    const from = msgParams.from;
    const signer = this.resolveSigner(from);

    if (!signer) {
      throw new Error(`Account not found: ${from}`);
    }

    const data = EthUtil.toBuffer(msgParams.data);
    const digest = EthUtil.hashPersonalMessage(data);
    const signature = await signer.sign(digest);

    return `0x${signature.toString()}`;
  }

  public send(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback) {
    this.engine.sendAsync(payload, callback);
  }

  public sendAsync(
    payload: JSONRPCRequestPayload,
    callback: JSONRPCErrorCallback
  ) {
    this.engine.sendAsync(payload, callback);
  }

  private resolveSigner(address: string) {
    const index = this.cacheAccounts
      .map((account) => account.toLowerCase())
      .indexOf(address.toLowerCase());
    if (index !== -1) {
      return this.signers[index];
    }
  }

  private async getTransactionOptions(): Promise<TransactionOptions> {
    const isNetworkOptions = (
      x: Network | NetworkOptions
    ): x is NetworkOptions => {
      return (
        typeof x === "object" &&
        typeof x.chainName === "string" &&
        typeof x.chainId === "number" &&
        typeof x.networkId === "number"
      );
    };

    if (!this.networkOrNetworkOptions) {
      const networkId = Number.parseInt(await this.ethereum.netVersion());
      const common = Common.forCustomChain(
        "mainnet",
        {
          chainId: networkId,
          networkId,
        },
        "petersburg"
      );
      return {
        common,
      };
    }

    if (isNetworkOptions(this.networkOrNetworkOptions)) {
      const networkOptions = this.networkOrNetworkOptions;
      return {
        common: Common.forCustomChain("mainnet", networkOptions),
      };
    }

    const newtwork = this.networkOrNetworkOptions;
    return { chain: newtwork };
  }

  private async createTransaction(txData: TxData): Promise<Transaction> {
    const opts = await this.getTransactionOptions();
    return new Transaction(txData, opts);
  }
}
