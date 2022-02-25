import createKeccakHash from "keccak";

import { Address } from "./address.js";

export class PublicKey {
  public readonly buffer: Buffer;
  private constructor(buffer: Buffer) {
    this.buffer = buffer;

    if (this.buffer.length !== 64) {
      throw TypeError(
        `PublicKey: invalid public key. buffer length must be 64. actual: ${this.buffer.length}`
      );
    }
  }

  public static fromBuffer(buffer: Buffer): PublicKey {
    return new PublicKey(buffer);
  }

  public toAddress(): Address {
    const address = createKeccakHash("keccak256")
      .update(this.buffer)
      .digest()
      .slice(12, 32);

    return Address.fromBuffer(address);
  }

  public equals(other: PublicKey): boolean {
    return this.buffer.equals(other.buffer);
  }
}
