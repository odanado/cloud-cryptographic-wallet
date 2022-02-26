export class Bytes {
  public readonly buffer: ArrayBuffer;
  private constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
  }

  public get asUint8Array(): Uint8Array {
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

  public static concat(bytesList: Bytes[]): Bytes {
    const total = bytesList.reduce((prev, cur) => prev + cur.length, 0);
    const result = new Uint8Array(total);

    let offset = 0;
    for (const bytes of bytesList) {
      result.set(bytes.asUint8Array, offset);
      offset += bytes.length;
    }
    return Bytes.fromArrayBuffer(result.buffer);
  }

  public slice(begin: number, end?: number | undefined): Bytes {
    return Bytes.fromArrayBuffer(this.buffer.slice(begin, end));
  }

  public readUInt8(index: number): number {
    const result = this.asUint8Array[index];

    if (!result) {
      throw new Error(`Bytes: invalid index access. index: ${index}`);
    }

    return result;
  }

  public equals(other: Bytes): boolean {
    return this.asUint8Array.every((_, index) => {
      return this.readUInt8(index) === other.readUInt8(index);
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
