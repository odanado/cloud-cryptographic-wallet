import { Bytes } from "./bytes.js";
import { PublicKey } from "./public-key.js";
import { Signature } from "./signature.js";

export interface Signer {
  sign(hash: Bytes): Promise<Signature>;
  getPublicKey(): Promise<PublicKey>;
}
