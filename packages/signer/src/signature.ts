import BN from "bn.js";
import secp256k1 from "secp256k1";
import { PublicKey } from "./public-key.js";

export class Signature {
  public readonly buffer: Buffer;

  private validate() {
    if (this.buffer.length !== 65) {
      throw TypeError(
        `Signature: invalid signature. buffer length must be 65. actual: ${this.buffer.length}`
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

    if (new BN(this.s).cmp(secp256k1halfN) > 0) {
      throw Error(
        `Signature: invalid signature. S must be less than or equal to secp256k1halfN.`
      );
    }
  }

  private constructor(buffer: Buffer) {
    this.buffer = buffer;

    this.validate();
  }

  public recoveryPublicKey(hash: Buffer): PublicKey {
    const publicKey = secp256k1
      .ecdsaRecover(
        Uint8Array.from(Buffer.concat([this.r, this.s])),
        this.recovery,
        Uint8Array.from(hash),
        false
      )
      .slice(1);

    return PublicKey.fromBuffer(Buffer.from(publicKey));
  }

  public static fromBuffer(buffer: Buffer): Signature {
    return new Signature(buffer);
  }

  public static fromRSV(r: Buffer, s: Buffer, v: number): Signature {
    const recovery = Buffer.alloc(1);
    recovery.writeUInt8(v, 0);

    return Signature.fromBuffer(Buffer.concat([r, s, recovery]));
  }

  public static fromHash(
    hash: Buffer,
    publicKey: PublicKey,
    r: Buffer,
    s: Buffer
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

  public get r(): Buffer {
    return this.buffer.slice(0, 32);
  }
  public get s(): Buffer {
    return this.buffer.slice(32, 64);
  }
  public get v(): number {
    return this.buffer.readUInt8(64);
  }

  public get recovery(): number {
    return 1 - (this.v % 2);
  }
}
