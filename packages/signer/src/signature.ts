import BN from "bn.js";

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

  public static fromBuffer(buffer: Buffer): Signature {
    return new Signature(buffer);
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
