import AWS from "aws-sdk";

import { Signer, Signature } from "./signer";
import { parseSignature, parsePublicKey } from "../asn1-parser";
import { recover, toAddress, secp256k1halfN, secp256k1N } from "../crypto";
import BN from "bn.js";

export class KmsSigner implements Signer {
  private readonly kms: AWS.KMS;
  private readonly keyId: string;

  public constructor(region: string, keyId: string) {
    this.keyId = keyId;
    this.kms = new AWS.KMS({ region });
  }

  public async sign(digest: Buffer): Promise<Signature> {
    const response = await this._sign(digest);
    if (!Buffer.isBuffer(response.Signature)) {
      throw new TypeError("Signature is not BUffer");
    }

    const { r, s } = parseSignature(response.Signature);
    const v = await this.solveV(digest, r, s);

    const signature: Signature = {
      r,
      ...this.flip(s, v)
    };

    return signature;
  }

  public async getAddress(): Promise<Buffer> {
    const response = await this._getPublicKey();

    if (!Buffer.isBuffer(response.PublicKey)) {
      throw new TypeError("PublicKey is not Buffer");
    }

    const publicKey = parsePublicKey(response.PublicKey);
    return toAddress(publicKey);
  }

  private async _getPublicKey() {
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

  private async solveV(digest: Buffer, r: Buffer, s: Buffer): Promise<number> {
    console.log("solveV", r, s);
    const address = await this.getAddress();
    const candidate = [...new Array(2).keys()].filter(v => {
      const publicKey = recover(digest, r, s, v);

      return address.equals(toAddress(publicKey));
    });

    if (candidate.length === 1) {
      return candidate[0];
    }
    throw new Error(`invalid ${candidate}`);
  }

  private flip(_s: Buffer, v: number) {
    // EIP-2
    const s = new BN(_s);
    if (s.cmp(secp256k1halfN) > 0) {
      return {
        v: v ^ 1,
        s: secp256k1N.sub(s).toBuffer()
      };
    }
    return { s: _s, v };
  }
}
