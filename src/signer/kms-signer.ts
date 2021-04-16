import AWS from "aws-sdk";

import { Signer } from "./signer";
import { Signature } from "../signature";
import { parseSignature, parsePublicKey } from "../asn1-parser";
import { Address } from "../address";
import { AwsCredential } from "../provider";

export class KmsSigner implements Signer {
  private readonly kms: AWS.KMS;
  private readonly keyId: string;

  public constructor(
    region: string,
    keyId: string,
    credential?: AwsCredential
  ) {
    this.keyId = keyId;
    this.kms = new AWS.KMS({
      region,
      accessKeyId: credential?.accessKeyId,
      secretAccessKey: credential?.secretAccessKey,
    });
  }

  public async sign(digest: Buffer): Promise<Signature> {
    const asn1Signature = await this._sign(digest);
    const address = await this.getAddress();
    const { r, s } = parseSignature(asn1Signature);
    return Signature.fromDigest(digest, address, r, s);
  }

  public async getAddress(): Promise<Address> {
    const asn1PublicKey = await this._getPublicKey();

    const publicKey = parsePublicKey(asn1PublicKey);
    return Address.fromPublicKey(publicKey);
  }

  private async _getPublicKey(): Promise<Buffer> {
    const response = await this.kms
      .getPublicKey({ KeyId: this.keyId })
      .promise();

    if (!Buffer.isBuffer(response.PublicKey)) {
      throw new TypeError("PublicKey is not Buffer");
    }
    return response.PublicKey;
  }

  private async _sign(digest: Buffer) {
    const response = await this.kms
      .sign({
        KeyId: this.keyId,
        Message: digest,
        MessageType: "DIGEST",
        SigningAlgorithm: "ECDSA_SHA_256",
      })
      .promise();
    if (!Buffer.isBuffer(response.Signature)) {
      throw new TypeError("Signature is not Buffer");
    }
    return response.Signature;
  }
}
