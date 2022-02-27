import { ethers } from "ethers";
import type { TransactionRequest } from "@ethersproject/abstract-provider";

import { Bytes, Signer } from "@cloud-cryptographic-wallet/signer";

export type EthersAdapterConfig = {
  signer: Signer;
};

export class EthersAdapter extends ethers.Signer {
  private readonly config: EthersAdapterConfig;
  private readonly logger: ethers.utils.Logger;

  constructor(
    config: EthersAdapterConfig,
    provider?: ethers.providers.Provider
  ) {
    super();

    ethers.utils.defineReadOnly(this, "provider", provider);

    this.config = config;

    const version = "0.1.0";
    this.logger = new ethers.utils.Logger(version);
  }

  async getAddress(): Promise<string> {
    const address = (await this.config.signer.getPublicKey()).toAddress();

    return ethers.utils.getAddress(address.toString());
  }

  async signMessage(message: ethers.utils.Bytes | string): Promise<string> {
    const hash = Bytes.fromString(ethers.utils.hashMessage(message));

    const signature = await this.config.signer.sign(hash);

    return signature.bytes.toString();
  }

  async signTransaction(
    deferrableTransaction: ethers.utils.Deferrable<TransactionRequest>
  ): Promise<string> {
    const transaction = await ethers.utils.resolveProperties(
      deferrableTransaction
    );

    const address = await this.getAddress();

    if (transaction.from != null) {
      if (ethers.utils.getAddress(transaction.from) !== address) {
        this.logger.throwArgumentError(
          "transaction from address mismatch",
          "transaction.from",
          transaction.from
        );
      }
    }

    const nonce = transaction.nonce
      ? ethers.BigNumber.from(transaction.nonce).toNumber()
      : undefined;

    const unsignedTransaction: ethers.utils.UnsignedTransaction = {
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
      Object.keys(unsignedTransaction) as Array<
        keyof ethers.utils.UnsignedTransaction
      >
    ).forEach((key) => {
      if (key in unsignedTransaction && unsignedTransaction[key] == undefined) {
        delete unsignedTransaction[key];
      }
    });
    const hash = ethers.utils.keccak256(
      ethers.utils.serializeTransaction(unsignedTransaction)
    );

    const signature = await this.config.signer.sign(Bytes.fromString(hash));

    const ethersSignature = ethers.utils.splitSignature({
      v: signature.v,
      r: signature.r.toString(),
      s: signature.s.toString(),
    });

    return ethers.utils.serializeTransaction(
      unsignedTransaction,
      ethersSignature
    );
  }

  connect(provider: ethers.providers.Provider): EthersAdapter {
    return new EthersAdapter(this.config, provider);
  }
}
