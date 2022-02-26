import * as asn1js from "asn1js";

export function parsePublicKey(inputBuffer: ArrayBuffer): ArrayBuffer {
  const schema = new asn1js.Sequence({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    value: [
      new asn1js.Sequence({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        value: [new asn1js.ObjectIdentifier(), new asn1js.ObjectIdentifier()],
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      new asn1js.BitString({ name: "publicKey" }),
    ],
  });
  const parsed = asn1js.verifySchema(inputBuffer, schema);

  const publicKey = parsed.result.publicKey.valueBlock.valueHex as ArrayBuffer;

  // remove 04
  return publicKey.slice(1);
}
