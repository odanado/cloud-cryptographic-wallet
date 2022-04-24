import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";
import {
  Bytes,
  PublicKey,
  Signature,
  Signer,
} from "@cloud-cryptographic-wallet/signer";

export class SignerForTest implements Signer {
  private privateKey;
  constructor() {
    let privateKey: Buffer;
    do {
      privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    this.privateKey = privateKey;
  }
  getPublicKey(): Promise<PublicKey> {
    return Promise.resolve(
      PublicKey.fromBytes(
        Bytes.fromArrayBuffer(
          secp256k1.publicKeyCreate(this.privateKey, false).slice(1)
        )
      )
    );
  }
  sign(hash: Bytes): Promise<Signature> {
    const { signature, recid } = secp256k1.ecdsaSign(
      hash.asUint8Array,
      this.privateKey
    );

    return Promise.resolve(
      Signature.fromRSV(
        Bytes.fromArrayBuffer(signature.slice(0, 64)),
        Bytes.fromArrayBuffer(signature.slice(64)),
        recid
      )
    );
  }
}
