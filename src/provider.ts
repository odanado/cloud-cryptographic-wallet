import Web3 from "web3";
import ProviderEngine from "web3-provider-engine";
import HookedSubprovider, {
  TxData,
} from "web3-provider-engine/subproviders/hooked-wallet";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
import { Transaction } from "ethereumjs-tx";
import Common from "ethereumjs-common";

import {
  Provider,
  JSONRPCRequestPayload,
  JSONRPCErrorCallback,
} from "ethereum-protocol";

import { KmsSigner } from "./signer/kms-signer";
import { hash } from "./crypto";

export interface KmsOptions {
  region: string;
  keyIds: string[];
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
  private readonly networkOrNetworkOptions: Network | NetworkOptions;

  public constructor(
    endpoint: string,
    kmsOptions: KmsOptions,
    networkOrNetworkOptions: Network | NetworkOptions
  ) {
    this.engine = new ProviderEngine();
    this.signers = kmsOptions.keyIds.map(
      (keyId) => new KmsSigner(kmsOptions.region, keyId)
    );
    this.networkOrNetworkOptions = networkOrNetworkOptions;

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
        signPersonalMessage: (msgParams, callback) => {
          console.log(msgParams);

          const message = Buffer.from(msgParams.data.slice(2), "hex");
          const digest = hash(message);
          this.sign(msgParams.from, digest)
            .then((signature) => {
              callback(null, `0x${signature.buffer.toString("hex")}`);
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
    this.cacheAccounts = addresses.map((address) =>
      Web3.utils.toChecksumAddress(address.toString("hex"))
    );
    return this.cacheAccounts;
  }

  public async signTransaction(txData: TxData) {
    const tx = this.createTransaction(txData);
    const digest = tx.hash(false);

    const signature = await this.sign(txData.from, digest);
    const v = Buffer.alloc(1);
    v.writeUInt8(signature.v + tx.getChainId() * 2 + 8, 0);

    tx.r = signature.r;
    tx.s = signature.s;
    tx.v = v;

    const rawTx = `0x${tx.serialize().toString("hex")}`;

    return rawTx;
  }

  public sendAsync(
    payload: JSONRPCRequestPayload,
    callback: JSONRPCErrorCallback
  ) {
    this.engine.sendAsync(payload, callback);
  }

  private sign(address: string, digest: Buffer) {
    const signer = this.resolveSigner(address);

    if (!signer) {
      throw new Error(`Account not found: ${address}`);
    }

    return signer.sign(digest);
  }
  private resolveSigner(address: string) {
    const index = this.cacheAccounts
      .map((account) => account.toLowerCase())
      .indexOf(address.toLowerCase());
    if (index !== -1) {
      return this.signers[index];
    }
  }

  private createTransaction(txData: TxData): Transaction {
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
    if (isNetworkOptions(this.networkOrNetworkOptions)) {
      const networkOptions = this.networkOrNetworkOptions;
      return new Transaction(txData, {
        common: Common.forCustomChain("mainnet", networkOptions),
      });
    }
    const newtwork = this.networkOrNetworkOptions;
    return new Transaction(txData, { chain: newtwork });
  }
}
