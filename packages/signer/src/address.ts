import createKeccakHash from "keccak";

import { Bytes } from "./bytes.js";

export class Address {
  public readonly bytes: Bytes;
  private constructor(bytes: Bytes) {
    this.bytes = bytes;

    if (this.bytes.length !== 20) {
      throw TypeError(
        `Address: invalid public key. address must be 20 bytes. actual: ${this.bytes.length}`
      );
    }
  }

  public static fromBytes(bytes: Bytes): Address {
    return new Address(bytes);
  }

  public equals(other: Address): boolean {
    return this.bytes.equals(other.bytes);
  }

  public toString(): string {
    const withoutPrefix = this.bytes.toString().slice(2);
    return `0x${this.toChecksumAddress(withoutPrefix)}`;
  }

  private toChecksumAddress(address: string): string {
    // EIP-55 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md#implementation
    const hash = createKeccakHash("keccak256").update(address).digest("hex");
    return address
      .split("")
      .map((c, i) => {
        return Number.parseInt(hash[i], 16) > 7 ? c.toUpperCase() : c;
      })
      .join("");
  }
}
