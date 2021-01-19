import { Signature } from "../signature";
import { Address } from "../address";

export interface Signer {
  sign(digest: Buffer): Promise<Signature>;
  getAddress(): Promise<Address>;
}
