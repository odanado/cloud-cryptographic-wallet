import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
  KMSClientConfig,
} from "@aws-sdk/client-kms";

import { Signer } from "./signer";
import { Signature } from "../signature";
import { parseSignature, parsePublicKey } from "../asn1-parser";
import { Address } from "../address";

export class KmsSigner implements Signer {
  private readonly keyId: string;
  private readonly client: KMSClient;

  public constructor(keyId: string, config?: KMSClientConfig) {
    this.keyId = keyId;

    this.client = new KMSClient(config ?? {});
  }

  public async sign(digest: Buffer): Promise<Signature> {
    const asn1Signature = await this._sign(digest);
    const address = await this.getAddress();
    const { r, s } = parseSignature(asn1Signature);
    return Signature.fromDigest(digest, address, r, s);
  }

  public async getAddress(): Promise<Address> {
    const asn1PublicKey = await this.getPublicKey();

    const publicKey = parsePublicKey(asn1PublicKey);
    return Address.fromPublicKey(publicKey);
  }

  public async getPublicKey(): Promise<Buffer> {
    const command = new GetPublicKeyCommand({ KeyId: this.keyId });

    const response = await this.client.send(command);
    if (!response.PublicKey) {
      throw new TypeError("PublicKey is undefined");
    }

    return Buffer.from(response.PublicKey);
  }

  private async _sign(digest: Buffer) {
    const command = new SignCommand({
      KeyId: this.keyId,
      Message: digest,
      MessageType: "DIGEST",
      SigningAlgorithm: "ECDSA_SHA_256",
    });
    const response = await this.client.send(command);

    if (!response.Signature) {
      throw new TypeError("Signature is undefined");
    }

    return Buffer.from(response.Signature);
  }
}
