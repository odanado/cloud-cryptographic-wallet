import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
} from "@aws-sdk/client-kms";

import { Signer } from "./signer";
import { Signature } from "../signature";
import { parseSignature, parsePublicKey } from "../asn1-parser";
import { Address } from "../address";
import { AwsCredential } from "../provider";

export class KmsSigner implements Signer {
  private readonly keyId: string;
  private readonly client: KMSClient;

  public constructor(
    region: string,
    keyId: string,
    credential?: AwsCredential
  ) {
    this.keyId = keyId;

    this.client = new KMSClient({ region, credentials: credential });
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
    const command = new GetPublicKeyCommand({ KeyId: this.keyId });

    const response = await this.client.send(command);
    if (!Buffer.isBuffer(response.PublicKey)) {
      throw new TypeError("PublicKey is not Buffer");
    }
    return response.PublicKey;
  }

  private async _sign(digest: Buffer) {
    const command = new SignCommand({
      KeyId: this.keyId,
      Message: digest,
      MessageType: "DIGEST",
      SigningAlgorithm: "ECDSA_SHA_256",
    });
    const response = await this.client.send(command);

    if (!Buffer.isBuffer(response.Signature)) {
      throw new TypeError("Signature is not Buffer");
    }
    return response.Signature;
  }
}
