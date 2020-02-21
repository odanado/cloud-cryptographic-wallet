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
