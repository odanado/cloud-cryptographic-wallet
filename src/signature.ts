export class Signature {
  private readonly buffer: Buffer;

  public constructor(buffer: Buffer) {
    if (buffer.length !== 65) {
      throw TypeError(`Signature: invalid length: ${buffer.length}`);
    }

    this.buffer = buffer;
  }

  public get r(): Buffer {
    return this.buffer.slice(0, 32);
  }
  public get s(): Buffer {
    return this.buffer.slice(32, 65);
  }
  public get v(): number {
    return this.buffer.readUInt8(65);
  }

  public get recovery(): number {
    return this.v;
  }
}
