import ProviderEngine from "web3-provider-engine";
import HookedSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
import { Transaction, TxData } from "ethereumjs-tx";

import {
  Provider,
  JSONRPCRequestPayload,
  JSONRPCErrorCallback
} from "ethereum-protocol";

import { KmsSigner } from "./signer/kms-signer";

export interface KmsOptions {
  region: string;
  keyId: string;
}

export class KmsProvider implements Provider {
  private readonly engine: ProviderEngine;
  private readonly signer: KmsSigner;
  public constructor(endpoint: string, kmsOptions: KmsOptions) {
    this.engine = new ProviderEngine();
    this.signer = new KmsSigner(kmsOptions.region, kmsOptions.keyId);

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
    const address = await this.signer.getAddress();
    return [`0x${address.toString("hex")}`];
  }

  public async signTransaction(txData: TxData) {
    // TODO: fix chain id
    const tx = new Transaction(txData, { chain: "ropsten" });
    const digest = tx.hash(false);

    const signature = await this.signer.sign(digest);
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
}
