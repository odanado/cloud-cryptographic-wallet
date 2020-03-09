import { Signature } from "../signature";

export interface Signer {
  sign(digest: Buffer): Promise<Signature>;
  getAddress(): Promise<Buffer>;
}
