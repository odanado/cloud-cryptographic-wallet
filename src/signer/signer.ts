export interface Signature {
  r: Buffer;
  s: Buffer;
  v: number;
}

export interface Signer {
  sign(digest: Buffer): Promise<Signature>;
  getAddress(): Promise<Buffer>;
}
