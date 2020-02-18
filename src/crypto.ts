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
  return createKeccakHash("keccak256")
    .update(data)
    .digest();
}

export function recover(
  messageHash: Buffer,
  r: Buffer,
  s: Buffer
  //v: Buffer
): Address {
  console.log(r.length, s.length);
  if (r.length !== 32) {
    throw new Error("invalid signature length");
  }
  if (s.length !== 32) {
    throw new Error("invalid signature length");
  }
  const recovery = 1 % 2;
  const pubkey = secp256k1
    .recover(messageHash, Buffer.concat([r, s]), recovery, false)
    .slice(1);
  const address = hash(pubkey).slice(12, 32);

  return addHexadecimalPrefix(address.toString("hex"));
}
