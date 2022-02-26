import BN from "bn.js";
import secp256k1 from "secp256k1";

import { Bytes } from "./bytes.js";
import { PublicKey } from "./public-key.js";

export class Signature {
  public readonly bytes: Bytes;

  private validate() {
    if (this.bytes.length !== 65) {
      throw TypeError(
        `Signature: invalid signature. buffer length must be 65 bytes. actual: ${this.bytes.length}`
      );
    }

    if (![27, 28].includes(this.v)) {
      throw Error(
        `Signature: invalid signature. V must be 27 or 28. actual: ${this.recovery}`
      );
    }

    const secp256k1N = new BN(
      "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
      16
    );
    const secp256k1halfN = secp256k1N.div(new BN(2));

    if (new BN(this.s.asUint8Array).cmp(secp256k1halfN) > 0) {
      throw Error(
        `Signature: invalid signature. S must be less than or equal to secp256k1halfN.`
      );
    }
  }

  private constructor(bytes: Bytes) {
    this.bytes = bytes;

    this.validate();
  }

  public recoveryPublicKey(hash: Bytes): PublicKey {
    const publicKey = secp256k1
      .ecdsaRecover(
        Bytes.concat([this.r, this.s]).asUint8Array,
        this.recovery,
        hash.asUint8Array,
        false
      )
      .slice(1);

    return PublicKey.fromBytes(Bytes.fromArrayBuffer(publicKey.buffer));
  }

  public static fromBytes(bytes: Bytes): Signature {
    return new Signature(bytes);
  }

  public static fromRSV(r: Bytes, s: Bytes, v: number): Signature {
    const recovery = new Uint8Array([v]);

    const bytes = Bytes.concat([r, s, Bytes.fromArrayBuffer(recovery.buffer)]);

    return Signature.fromBytes(bytes);
  }

  public static fromHash(
    hash: Bytes,
    publicKey: PublicKey,
    r: Bytes,
    s: Bytes
  ): Signature {
    const candidate = [27, 28].filter((v) => {
      const candidateSignature = Signature.fromRSV(r, s, v);
      const candidatePublicKey = candidateSignature.recoveryPublicKey(hash);

      return publicKey.equals(candidatePublicKey);
    });

    if (candidate.length === 1) {
      const v = candidate[0];
      return Signature.fromRSV(r, s, v);
    }
    throw new Error(`Signature: failed to solve V.`);
  }

  public get r(): Bytes {
    return this.bytes.slice(0, 32);
  }
  public get s(): Bytes {
    return this.bytes.slice(32, 64);
  }
  public get v(): number {
    return this.bytes.readUInt8(64);
  }

  public get recovery(): number {
    return 1 - (this.v % 2);
  }
}
