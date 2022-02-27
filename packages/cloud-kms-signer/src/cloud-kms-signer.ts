import { createPublicKey } from "crypto";

import { KeyManagementServiceClient } from "@google-cloud/kms";
import { crc32c } from "@node-lightning/checksum";

import {
  Bytes,
  PublicKey,
  Signature,
  Signer,
} from "@cloud-cryptographic-wallet/signer";
import {
  parsePublicKey,
  parseSignature,
} from "@cloud-cryptographic-wallet/asn1-parser";

type ClientOptions = ConstructorParameters<
  typeof KeyManagementServiceClient
>[0];

export class CloudKmsSigner implements Signer {
  private readonly client: KeyManagementServiceClient;
  private readonly name: string;

  private cachePublicKey?: PublicKey;

  constructor(name: string, clientOptions?: ClientOptions) {
    this.client = new KeyManagementServiceClient(clientOptions ?? {});
    this.name = name;
  }

  async sign(hash: Bytes): Promise<Signature> {
    const [signResponse] = await this.client.asymmetricSign({
      name: this.name,
      digest: {
        sha256: hash.asUint8Array,
      },
    });

    if (!(signResponse.signature instanceof Uint8Array)) {
      throw new TypeError(
        "CloudKmsSigner: signResponse.signature isn't Uint8Array."
      );
    }

    if (
      crc32c(Buffer.from(signResponse.signature)) !==
      Number(signResponse.signatureCrc32c?.value)
    ) {
      throw new Error(
        "CloudKmsSigner: failed to validate of crc32c signResponse.signature."
      );
    }

    const { r, s } = parseSignature(
      new Uint8Array(signResponse.signature).buffer
    );

    const publicKey = await this.getPublicKey();

    return Signature.fromHash(
      hash,
      publicKey,
      Bytes.fromArrayBuffer(r),
      Bytes.fromArrayBuffer(s)
    );
  }

  async getPublicKey(): Promise<PublicKey> {
    if (this.cachePublicKey) {
      return this.cachePublicKey;
    }
    const [publicKeyResponse] = await this.client.getPublicKey({
      name: this.name,
    });

    if (publicKeyResponse.name !== this.name) {
      throw new Error(`CloudKmsSigner: incorrect name. actual: ${this.name}`);
    }

    if (publicKeyResponse.pem == undefined) {
      throw new Error("CloudKmsSigner: publicKeyResponse.pem is undefined.");
    }

    if (
      crc32c(Buffer.from(publicKeyResponse.pem)) !==
      Number(publicKeyResponse.pemCrc32c?.value)
    ) {
      throw new Error(
        "CloudKmsSigner: failed to validate of crc32c publicKeyResponse.pem."
      );
    }

    const key = createPublicKey({ key: publicKeyResponse.pem, format: "pem" });

    const buffer = key.export({ format: "der", type: "spki" });

    const bytes = Bytes.fromString(buffer.toString("hex"));

    const rawPublicKey = parsePublicKey(bytes.buffer);

    const publicKey = PublicKey.fromBytes(Bytes.fromArrayBuffer(rawPublicKey));

    this.cachePublicKey = publicKey;

    return publicKey;
  }
}
