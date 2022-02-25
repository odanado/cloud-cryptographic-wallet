import createKeccakHash from "keccak";

export class Address {
  public readonly buffer: Buffer;
  private constructor(buffer: Buffer) {
    this.buffer = buffer;

    if (this.buffer.length !== 20) {
      throw TypeError(
        `Address: invalid public key. buffer length must be 20. actual: ${this.buffer.length}`
      );
    }
  }

  public static fromBuffer(buffer: Buffer): Address {
    return new Address(buffer);
  }

  public equals(other: Address): boolean {
    return this.buffer.equals(other.buffer);
  }

  public toString(): string {
    return `0x${this.toChecksumAddress(this.buffer.toString("hex"))}`;
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
