import AWS from "aws-sdk";

import { Signer, Signature } from "./signer";
import { parseSignature, parsePublicKey } from "../asn1-parser";

export class KmsSigner implements Signer {
  private readonly kms: AWS.KMS;
  private readonly keyId: string;

  public constructor(region: string, keyId: string) {
    this.keyId = keyId;
    this.kms = new AWS.KMS({ region });
  }

  public async sign(digest: Buffer): Promise<Signature> {
    const response = await this._sign(digest);
    if (!response.Signature) {
      throw new Error("signature is undefined");
    }

    if (!Buffer.isBuffer(response.Signature)) {
      throw new TypeError("signature is not BUffer");
    }

    const signature = parseSignature(response.Signature);

    return {
      v: 0,
      ...signature
    };
  }

  public async getAddress(): Promise<Buffer> {
    const response = await this._getPublicKey();

    if (!Buffer.isBuffer(response.PublicKey)) {
      throw new TypeError("public key is not BUffer");
    }

    const publicKey = parsePublicKey(response.PublicKey);
    return publicKey;
  }

  private _getPublicKey() {
    return new Promise<AWS.KMS.GetPublicKeyResponse>((resolve, reject) => {
      this.kms.getPublicKey({ KeyId: this.keyId }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  private _sign(digest: Buffer) {
    return new Promise<AWS.KMS.SignResponse>((resolve, reject) => {
      this.kms.sign(
        {
          KeyId: this.keyId,
          Message: digest,
          MessageType: "DIGEST",
          SigningAlgorithm: "ECDSA_SHA_256"
        },
        (err, data) => {
          if (err) return reject(err);
          resolve(data);
        }
      );
    });
  }
}
