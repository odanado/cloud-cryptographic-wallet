import createKeccakHash from "keccak";

export class Address {
  private readonly publicKey: Buffer;
  private constructor(publicKey: Buffer) {
    if (publicKey.length !== 32) {
      throw TypeError(
        `Address: invalid public key. buffer length must be 32. actual: ${publicKey.length}`
      );
    }
    this.publicKey = publicKey;
  }
  public static fromPublicKey(publicKey: Buffer): Address {
    return new Address(publicKey);
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
    const address = createKeccakHash("keccak256")
      .update(this.publicKey)
      .digest("hex");

    return this.toChecksumAddress(address);
  }

  public equals(other: Address): boolean {
    return this.publicKey.equals(other.publicKey);
  }
}
