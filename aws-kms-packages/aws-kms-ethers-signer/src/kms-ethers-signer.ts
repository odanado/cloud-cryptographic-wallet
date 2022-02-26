import { Signer } from "@ethersproject/abstract-signer";
import { defineReadOnly } from "@ethersproject/properties";

import type { Deferrable } from "@ethersproject/properties";
import type { Bytes } from "@ethersproject/bytes";
import type {
  Provider,
  TransactionRequest,
} from "@ethersproject/abstract-provider";
import type { KMSClientConfig } from "@aws-sdk/client-kms";
import { KmsSigner } from "aws-kms-signer";
import { Adapter } from "./adapter";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require("../package.json").version;

export type KmsEthersSignerConfig = {
  keyId: string;
  kmsClientConfig?: KMSClientConfig;
};

export class KmsEthersSigner extends Signer {
  private readonly kmsSigner: KmsSigner;
  private readonly adapter: Adapter;

  constructor(
    private readonly config: KmsEthersSignerConfig,
    provider?: Provider
  ) {
    super();
    defineReadOnly(this, "provider", provider);

    this.kmsSigner = new KmsSigner(config.keyId, config.kmsClientConfig ?? {});

    this.adapter = new Adapter({ signer: this.kmsSigner, version }, provider);
  }

  async getAddress(): Promise<string> {
    return this.adapter.getAddress();
  }

  async signMessage(message: Bytes | string): Promise<string> {
    return this.adapter.signMessage(message);
  }

  async signTransaction(
    deferrableTransaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    return this.adapter.signTransaction(deferrableTransaction);
  }

  connect(provider: Provider): KmsEthersSigner {
    return new KmsEthersSigner(this.config, provider);
  }
}
