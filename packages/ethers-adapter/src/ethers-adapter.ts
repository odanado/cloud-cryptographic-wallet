import {
  TransactionRequest,
  TypedDataDomain,
  TypedDataField,
  ethers,
} from "ethers";

import { Bytes, Signer } from "@cloud-cryptographic-wallet/signer";

export type EthersAdapterConfig = {
  signer: Signer;
};

export class EthersAdapter extends ethers.AbstractSigner<ethers.JsonRpcApiProvider> {
  private readonly config: EthersAdapterConfig;

  constructor(
    config: EthersAdapterConfig,
    provider: ethers.JsonRpcApiProvider
  ) {
    super(provider);

    this.config = config;
  }

  async signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): Promise<string> {
    // todo: not implemented yet.
    throw "signTypedData is not implemented.";
  }

  async getAddress(): Promise<string> {
    const address = (await this.config.signer.getPublicKey()).toAddress();

    return ethers.getAddress(address.toString());
  }

  async signMessage(message: ethers.BytesLike | string): Promise<string> {
    const hash = Bytes.fromString(ethers.hashMessage(message));

    const signature = await this.config.signer.sign(hash);

    return signature.bytes.toString();
  }

  async signTransaction(tx: TransactionRequest): Promise<string> {
    const transaction = await ethers.resolveProperties(tx);

    const address = await this.getAddress();

    if (transaction.from != null) {
      if (ethers.getAddress(transaction.from.toString()) !== address) {
        throw ethers.makeError(
          `transaction from address mismatch transaction.from ${transaction.from}`,
          "INVALID_ARGUMENT"
        );
      }
    }

    const unsignedTransaction: ethers.TransactionLike = {
      to: transaction.to as string,
      nonce: transaction.nonce,
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
      Object.keys(unsignedTransaction) as Array<keyof ethers.TransactionLike>
    ).forEach((key) => {
      if (key in unsignedTransaction && unsignedTransaction[key] == undefined) {
        delete unsignedTransaction[key];
      }
    });

    const txObj = ethers.Transaction.from(unsignedTransaction);

    const hash = ethers.keccak256(txObj.unsignedSerialized);

    const signature = await this.config.signer.sign(Bytes.fromString(hash));

    const ethersSignature = ethers.Signature.from({
      v: signature.v,
      r: signature.r.toString(),
      s: signature.s.toString(),
    });

    txObj.signature = ethersSignature;

    return txObj.serialized;
  }

  connect(provider: ethers.JsonRpcApiProvider): EthersAdapter {
    return new EthersAdapter(this.config, provider);
  }
}
