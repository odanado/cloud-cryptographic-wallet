import * as asn1js from "asn1js";

function toArrayBuffer(buffer: Buffer) {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function isUnsignedInteger(buffer: Buffer) {
  return buffer[0] === 0;
}

function pad(params: {
  buffer: Buffer;
  length: number;
  element: number;
}): Buffer {
  const { buffer, length, element } = params;

  const padding = Buffer.alloc(length - buffer.length, element);
  return Buffer.concat([padding, buffer]);
}

export function parsePublicKey(buf: Buffer): Buffer {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;

  const value = values[1] as asn1js.BitString;
  return Buffer.from(value.valueBlock.valueHex.slice(1));
}

/**
 * Parse signature from the given signature.
 * @param buf The buffer of the signature which following ASN.1 format.
 * @returns The set consists of, `r` and `s`. The `r` and `s` are parsed from the given signature and converted to 32 statically sized format from ASN.1 format. For example, if there is 33-bytes unsigned integer  formatted by ASN.1, it will be converted into 32-length bytes which dropped the first byte. (e.g. `00e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b` → `e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b`). And, if there is 31-bytes integer formatted by ASN.1, it will be padded into 32-length bytes with `0` byte. (e.g. `74e3e4d71e7385ae71042b0f99f7fbbf66e7760dd513ed2fcea754e2a9131c` → `0074e3e4d71e7385ae71042b0f99f7fbbf66e7760dd513ed2fcea754e2a9131c`).
 */
export function parseSignature(buf: Buffer): { r: Buffer; s: Buffer } {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;

  const getHex = (value: asn1js.Integer) =>
    Buffer.from(value.valueBlock.valueHex);

  let r = getHex(values[0] as asn1js.Integer);
  let s = getHex(values[1] as asn1js.Integer);

  if (isUnsignedInteger(r)) {
    r = r.slice(1);
  }

  if (isUnsignedInteger(s)) {
    s = s.slice(1);
  }

  r = pad({
    buffer: r,
    length: 32,
    element: 0,
  });

  s = pad({
    buffer: s,
    length: 32,
    element: 0,
  });

  return { r, s };
}
