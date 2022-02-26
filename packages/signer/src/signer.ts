import { PublicKey } from "./public-key.js";
import { Signature } from "./signature.js";

export interface Signer {
  sign(digest: Buffer): Promise<Signature>;
  getPublicKey(): Promise<PublicKey>;
}
