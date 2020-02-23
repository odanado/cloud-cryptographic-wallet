import * as asn1js from "asn1js";

function toArrayBuffer(buffer: Buffer) {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

export function parsePublicKey(buf: Buffer) {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;

  const value = values[1] as asn1js.BitString;
  return Buffer.from(value.valueBlock.valueHex.slice(1));
}

export function parseSignature(buf: Buffer) {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;

  const getHex = (value: asn1js.Integer) => {
    const buf = Buffer.from(value.valueBlock.valueHex);
    return buf.slice(Math.max(buf.length - 32, 0));
  };

  const r = getHex(values[0] as asn1js.Integer);
  const s = getHex(values[1] as asn1js.Integer);
  return { r, s };
}
