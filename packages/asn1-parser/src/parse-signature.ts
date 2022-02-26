import * as asn1js from "asn1js";

function normalize(inputBuffer: ArrayBuffer): ArrayBuffer {
  if (inputBuffer.byteLength === 32) {
    return inputBuffer;
  }
  if (inputBuffer.byteLength === 33) {
    return inputBuffer.slice(1);
  }
  if (inputBuffer.byteLength === 31) {
    return new Uint8Array([0, ...new Uint8Array(inputBuffer)]).buffer;
  }

  throw new Error(
    `parseSignature: Unexpected byte length of inputBuffer. actual: ${inputBuffer.byteLength}`
  );
}

export function parseSignature(inputBuffer: ArrayBuffer): {
  r: ArrayBuffer;
  s: ArrayBuffer;
} {
  const schema = new asn1js.Sequence({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    value: [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      new asn1js.Integer({ name: "r" }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      new asn1js.Integer({ name: "s" }),
    ],
  });

  const parsed = asn1js.verifySchema(inputBuffer, schema);

  if (!parsed.verified) {
    throw new Error("parseSignature: failed to parse");
  }
  const r = parsed.result.r.valueBlock.valueHex as ArrayBuffer;
  const s = parsed.result.s.valueBlock.valueHex as ArrayBuffer;

  return { r: normalize(r), s: normalize(s) };
}
