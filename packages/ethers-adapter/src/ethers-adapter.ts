import { Signer as EthersSigner } from "@ethersproject/abstract-signer";
import { getAddress } from "@ethersproject/address";
import {
  Deferrable,
  defineReadOnly,
  resolveProperties,
} from "@ethersproject/properties";
import type {
  Provider,
  TransactionRequest,
} from "@ethersproject/abstract-provider";
import { Bytes as EthersBytes, splitSignature } from "@ethersproject/bytes";
import { hashMessage } from "@ethersproject/hash";
import { Logger } from "@ethersproject/logger";
import { keccak256 } from "@ethersproject/keccak256";
import { BigNumber } from "@ethersproject/bignumber";
import { serialize, UnsignedTransaction } from "@ethersproject/transactions";

import { Bytes, Signer } from "@cloud-cryptographic-wallet/signer";

export type EthersAdapterConfig = {
  signer: Signer;
};

export class EthersAdapter extends EthersSigner {
  private readonly config: EthersAdapterConfig;
  private readonly logger: Logger;

  constructor(config: EthersAdapterConfig, provider?: Provider) {
    super();

    defineReadOnly(this, "provider", provider);

    this.config = config;

    const version = "0.1.0";
    this.logger = new Logger(version);
  }

  async getAddress(): Promise<string> {
    const address = (await this.config.signer.getPublicKey()).toAddress();

    return getAddress(address.toString());
  }

  async signMessage(message: EthersBytes | string): Promise<string> {
    const hash = Bytes.fromString(hashMessage(message));

    const signature = await this.config.signer.sign(hash);

    return signature.bytes.toString();
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
    const hash = keccak256(serialize(unsignedTransaction));

    const signature = await this.config.signer.sign(Bytes.fromString(hash));

    const ethersSignature = splitSignature({
      v: signature.v,
      r: signature.r.toString(),
      s: signature.s.toString(),
    });

    return serialize(unsignedTransaction, ethersSignature);
  }

  connect(provider: Provider): EthersAdapter {
    return new EthersAdapter(this.config, provider);
  }
}
