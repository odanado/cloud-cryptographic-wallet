import createKeccakHash from "keccak";

import { Address } from "./address.js";
import { Bytes } from "./bytes.js";

export class PublicKey {
  public readonly bytes: Bytes;
  private constructor(bytes: Bytes) {
    this.bytes = bytes;

    if (this.bytes.length !== 64) {
      throw TypeError(
        `PublicKey: invalid public key. buffer length must be 64 bytes. actual: ${this.bytes.length}`
      );
    }
  }

  public static fromBytes(bytes: Bytes): PublicKey {
    return new PublicKey(bytes);
  }

  public toAddress(): Address {
    const address = createKeccakHash("keccak256")
      .update(Buffer.from(this.bytes.toString().slice(2), "hex"))
      .digest()
      .slice(12, 32);

    return Address.fromBytes(Bytes.fromString(address.toString("hex")));
  }

  public equals(other: PublicKey): boolean {
    return this.bytes.equals(other.bytes);
  }
}
