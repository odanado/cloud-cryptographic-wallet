import ProviderEngine from "web3-provider-engine";
import HookedSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import { Transaction } from "ethereumjs-tx";

import {
  Provider,
  JSONRPCRequestPayload,
  JSONRPCErrorCallback
} from "ethereum-protocol";

import { KmsSigner } from "./signer/kms-signer";

export class KmsProvider implements Provider {
  private readonly engine: ProviderEngine;
  private readonly signer: KmsSigner;
  public constructor(region: string, keyId: string) {
    this.engine = new ProviderEngine();
    this.signer = new KmsSigner(region, keyId);

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
          const tx = new Transaction(txData, { chain: "rinkeby" });
          const digest = tx.hash(false);

          this.signer
            .sign(digest)
            .then(signature => {
              const v = Buffer.alloc(1);
              v.writeUInt8(signature.v + tx.getChainId() * 2 + 8, 0);

              tx.r = signature.r;
              tx.s = signature.s;
              tx.v = v;

              const rawTx = `0x${tx.serialize().toString("hex")}`;

              callback(null, rawTx);
            })
            .catch(err => callback(err));
        }
      })
    );
  }

  public async getAccounts(): Promise<string[]> {
    const address = await this.signer.getAddress();
    return [address.toString("hex")];
  }

  public sendAsync(
    payload: JSONRPCRequestPayload,
    callback: JSONRPCErrorCallback
  ) {
    this.engine.sendAsync(payload, callback);
  }
}
