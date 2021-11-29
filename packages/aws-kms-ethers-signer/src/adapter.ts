import type { Signer as ISigner } from "aws-kms-signer";

import { Signer } from "@ethersproject/abstract-signer";
import {
  Deferrable,
  defineReadOnly,
  resolveProperties,
} from "@ethersproject/properties";
import { Bytes, splitSignature } from "@ethersproject/bytes";
import type {
  Provider,
  TransactionRequest,
} from "@ethersproject/abstract-provider";
import { hashMessage } from "@ethersproject/hash";
import { Logger } from "@ethersproject/logger";
import { getAddress } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/keccak256";
import { BigNumber } from "@ethersproject/bignumber";
import { serialize, UnsignedTransaction } from "@ethersproject/transactions";

export type AdapterConfig = {
  signer: ISigner;
  version: string;
};

export class Adapter extends Signer {
  private readonly signer: ISigner;
  private readonly logger: Logger;

  constructor(config: AdapterConfig, provider?: Provider) {
    super();

    this.signer = config.signer;
    defineReadOnly(this, "provider", provider);

    this.logger = new Logger(config.version);
  }

  async getAddress(): Promise<string> {
    const address = await this.signer.getAddress();
    return getAddress(address.toString());
  }

  async signMessage(message: Bytes | string): Promise<string> {
    const digest = hashMessage(message);
    const signature = await this.signer.sign(
      Buffer.from(digest.slice(2), "hex")
    );

    return signature.toString();
  }

  async signTransaction(
    deferrableTransaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    const transaction = await resolveProperties(deferrableTransaction);

    const address = await this.getAddress();
    if (transaction.from != null) {
      if (getAddress(transaction.from) !== address) {
        this.logger.throwArgumentError(
          "transaction from address mismatch",
          "transaction.from",
          transaction.from
        );
      }
    }

    const nonce = transaction.nonce
      ? BigNumber.from(transaction.nonce).toNumber()
      : undefined;

    const unsignedTransaction: UnsignedTransaction = {
      to: transaction.to,
      nonce,
      gasLimit: transaction.gasLimit,
      gasPrice: transaction.gasPrice,
      data: transaction.data,
      value: transaction.value,
      chainId: transaction.chainId,
      type: transaction.type,
      accessList: transaction.accessList,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      maxFeePerGas: transaction.maxFeePerGas,
    };
    (
      Object.keys(unsignedTransaction) as Array<keyof UnsignedTransaction>
    ).forEach((key) => {
      if (key in unsignedTransaction && unsignedTransaction[key] == undefined) {
        delete unsignedTransaction[key];
      }
    });
    const digest = keccak256(serialize(unsignedTransaction));

    const signature = await this.signer.sign(
      Buffer.from(digest.slice(2), "hex")
    );

    const ethersSignature = splitSignature({
      v: signature.v,
      r: `0x${signature.r.toString("hex")}`,
      s: `0x${signature.s.toString("hex")}`,
    });

    return serialize(unsignedTransaction, ethersSignature);
  }

  connect(provider: Provider): Adapter {
    return new Adapter(
      { signer: this.signer, version: this.logger.version },
      provider
    );
  }
}
