import ProviderEngine from "web3-provider-engine";
import HookedSubprovider, {
  TxData
} from "web3-provider-engine/subproviders/hooked-wallet";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
import { Transaction } from "ethereumjs-tx";

import {
  Provider,
  JSONRPCRequestPayload,
  JSONRPCErrorCallback
} from "ethereum-protocol";

import { KmsSigner } from "./signer/kms-signer";

export interface KmsOptions {
  region: string;
  keyIds: string[];
}

export class KmsProvider implements Provider {
  private readonly engine: ProviderEngine;
  private readonly signers: KmsSigner[];
  private cacheAccounts: string[] = [];

  public constructor(endpoint: string, kmsOptions: KmsOptions) {
    this.engine = new ProviderEngine();
    this.signers = kmsOptions.keyIds.map(
      keyId => new KmsSigner(kmsOptions.region, keyId)
    );

    this.engine.addProvider(
      new HookedSubprovider({
        getAccounts: callback => {
          this.getAccounts()
            .then(accounts => {
              callback(null, accounts);
            })
            .catch(err => {
              callback(err);
            });
        },
        signTransaction: (txData, callback) => {
          this.signTransaction(txData)
            .then(rawTx => {
              callback(null, rawTx);
            })
            .catch(err => callback(err));
        }
      })
    );

    this.engine.addProvider(new RpcSubprovider({ rpcUrl: endpoint }));

    this.engine.start();
  }

  public async getAccounts(): Promise<string[]> {
    if (this.cacheAccounts.length !== 0) return this.cacheAccounts;

    const addresses = await Promise.all(
      this.signers.map(signer => signer.getAddress())
    );
    this.cacheAccounts = addresses.map(
      address => `0x${address.toString("hex")}`
    );
    return this.cacheAccounts;
  }

  public async signTransaction(txData: TxData) {
    const from = txData.from.toLowerCase();
    const signer = this.resolveSigner(from);

    if (!signer) {
      throw new Error(`Account not found: ${from}`);
    }

    // TODO: fix chain id
    const tx = new Transaction(txData, { chain: "ropsten" });
    const digest = tx.hash(false);

    const signature = await signer.sign(digest);
    const v = Buffer.alloc(1);
    v.writeUInt8(signature.v + tx.getChainId() * 2 + 35, 0);

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

  private resolveSigner(address: string) {
    const index = this.cacheAccounts.indexOf(address);
    if (index !== -1) {
      return this.signers[index];
    }
  }
}
