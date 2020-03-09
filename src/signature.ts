import BN = require("bn.js");
import { recover, toAddress } from "./crypto";
import { secp256k1N, secp256k1halfN } from "./constant";

export class Signature {
  private readonly buffer: Buffer;

  public constructor(buffer: Buffer) {
    if (buffer.length !== 65) {
      throw TypeError(
        `Signature: invalid signature. buffer length must be 65. actual: ${buffer.length}`
      );
    }

    this.buffer = buffer;

    if (![27, 28].includes(this.recovery)) {
      throw Error(
        `Signature: invalid signature. V must be 27 or 28. actual: ${this.recovery}`
      );
    }

    if (!this.isCompatibleEip2()) {
      const s = new BN(this.s);
      const recovery = Buffer.alloc(1);
      recovery.writeUInt8((this.v % 2) + 27, 0);

      this.buffer = Buffer.concat([
        this.r,
        secp256k1N.sub(s).toBuffer("be", 32),
        recovery
      ]);
    }
  }

  public static fromRSV(r: Buffer, s: Buffer, v: number): Signature {
    const recovery = Buffer.alloc(1);
    recovery.writeUInt8(v, 0);
    return new Signature(Buffer.concat([r, s, recovery]));
  }

  public static fromDigest(
    digest: Buffer,
    address: Buffer,
    r: Buffer,
    s: Buffer
  ): Signature {
    const candidate = [...new Array(2).keys()].filter(v => {
      const publicKey = recover(digest, r, s, v);

      return address.equals(toAddress(publicKey));
    });

    if (candidate.length === 1) {
      const v = candidate[0] + 27;
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
    return this.v;
  }

  public isCompatibleEip2(): boolean {
    const s = new BN(this.s);
    return secp256k1halfN.cmp(s) > 0;
  }
}
