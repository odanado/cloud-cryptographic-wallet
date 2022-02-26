export class Bytes {
  public readonly buffer: ArrayBuffer;
  private constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
  }

  private get asUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  public static fromArrayBuffer(buffer: ArrayBuffer): Bytes {
    return new Bytes(buffer);
  }

  public static fromString(hex: string): Bytes {
    const withoutPrefix = hex.startsWith("0x") ? hex.slice(2) : hex;

    if (!withoutPrefix.match(/[0-9a-f]+/i)) {
      throw new Error(
        `Bytes: string must be hexadecimal. actual: ${withoutPrefix}`
      );
    }

    if (withoutPrefix.length % 2 !== 0) {
      throw new Error(
        `Bytes: string must be an even number of length. actual: ${withoutPrefix.length}`
      );
    }

    const view = new Uint8Array(withoutPrefix.length / 2);
    for (let i = 0; i < withoutPrefix.length; i += 2) {
      view[i / 2] = Number.parseInt(withoutPrefix.slice(i, i + 2), 16);
    }

    return Bytes.fromArrayBuffer(view.buffer);
  }

  public equals(other: Bytes): boolean {
    return this.asUint8Array.every((value, index) => {
      return value === other.asUint8Array.at(index);
    });
  }

  public toString(): string {
    const withoutPrefix = Array.from(this.asUint8Array)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");

    return `0x${withoutPrefix}`;
  }

  public get length(): number {
    return this.buffer.byteLength;
  }
}
