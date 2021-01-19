import secp256k1 from "secp256k1";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const createKeccakHash = require("keccak");

export type Hash = string;
export type Address = string;

export function removeHexadecimalPrefix(x: string): string {
  if (x.startsWith("0x")) {
    return x.slice(2);
  }
  return x;
}

export function addHexadecimalPrefix(x: string): string {
  if (x.startsWith("0x")) {
    return x;
  }
  return `0x${x}`;
}

export function hash(data: Buffer): Buffer {
  return createKeccakHash("keccak256").update(data).digest();
}

export function recover(
  digest: Buffer,
  r: Buffer,
  s: Buffer,
  v: number
): Buffer {
  if (r.length !== 32) {
    throw new Error("invalid signature length");
  }
  if (s.length !== 32) {
    throw new Error("invalid signature length");
  }

  const publicKey = secp256k1
    .ecdsaRecover(
      Uint8Array.from(Buffer.concat([r, s])),
      v,
      Uint8Array.from(digest),
      false
    )
    .slice(1);

  return Buffer.from(publicKey);
}
