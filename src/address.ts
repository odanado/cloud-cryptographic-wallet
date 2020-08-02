import createKeccakHash from "keccak";

export class Address {
  private readonly buffer: Buffer;
  private constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  private static toAddress(publicKey: Buffer) {
    const address = createKeccakHash("keccak256")
      .update(publicKey)
      .digest()
      .slice(12, 32);
    return address;
  }
  public static fromPublicKey(publicKey: Buffer): Address {
    if (publicKey.length !== 64) {
      throw TypeError(
        `Address: invalid public key. buffer length must be 64. actual: ${publicKey.length}`
      );
    }

    return new Address(this.toAddress(publicKey));
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
  public toString(): string {
    return this.toChecksumAddress(this.buffer.toString("hex"));
  }

  public equals(other: Address): boolean {
    return this.buffer.equals(other.buffer);
  }
}
