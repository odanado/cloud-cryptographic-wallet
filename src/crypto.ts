import secp256k1 from "secp256k1";
import crypto from "crypto";

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
  return createKeccakHash("keccak256")
    .update(data)
    .digest();
}

export function toAddress(publicKey: Buffer) {
  return hash(publicKey).slice(12, 32);
}

export function recover(
  messageHash: Buffer,
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
    .recover(messageHash, Buffer.concat([r, s]), v, false)
    .slice(1);

  return publicKey;
}
