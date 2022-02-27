import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
  KMSClientConfig,
} from "@aws-sdk/client-kms";

import {
  PublicKey,
  Signer,
  Bytes,
  Signature,
} from "@cloud-cryptographic-wallet/signer";
import {
  parsePublicKey,
  parseSignature,
} from "@cloud-cryptographic-wallet/asn1-parser";

export class AwsKmsSigner implements Signer {
  private readonly client: KMSClient;
  private readonly keyId: string;
  constructor(keyId: string, config?: KMSClientConfig) {
    this.keyId = keyId;
    this.client = new KMSClient(config ?? {});
  }

  async sign(hash: Bytes): Promise<Signature> {
    const command = new SignCommand({
      KeyId: this.keyId,
      Message: hash.asUint8Array,
      MessageType: "DIGEST",
      SigningAlgorithm: "ECDSA_SHA_256",
    });

    const response = await this.client.send(command);

    if (!response.Signature) {
      throw new Error("AwsKmsSigner: Signature is undefined");
    }

    const { r, s } = parseSignature(new Uint8Array(response.Signature).buffer);

    const publicKey = await this.getPublicKey();
    return Signature.fromHash(
      hash,
      publicKey,
      Bytes.fromArrayBuffer(r),
      Bytes.fromArrayBuffer(s)
    );
  }
  async getPublicKey(): Promise<PublicKey> {
    const command = new GetPublicKeyCommand({ KeyId: this.keyId });

    const response = await this.client.send(command);
    if (!response.PublicKey) {
      throw new Error("AwsKmsSigner: PublicKey is undefined");
    }

    const pulbicKey = parsePublicKey(new Uint8Array(response.PublicKey).buffer);

    return PublicKey.fromBytes(Bytes.fromArrayBuffer(pulbicKey));
  }
}
