import BN from "bn.js";

export const secp256k1N = new BN(
  "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
  16
);
export const secp256k1halfN = secp256k1N.div(new BN(2));
