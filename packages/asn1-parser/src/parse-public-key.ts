import * as asn1js from "asn1js";

export function parsePublicKey(inputBuffer: ArrayBuffer): ArrayBuffer {
  const schema = new asn1js.Sequence({
    value: [
      new asn1js.Sequence({
        value: [new asn1js.ObjectIdentifier(), new asn1js.ObjectIdentifier()],
      }),
      new asn1js.BitString({ name: "publicKey" }),
    ],
  });
  const parsed = asn1js.verifySchema(inputBuffer, schema);

  if (!parsed.verified) {
    throw new Error(`parsePublicKey: failed to parse. ${parsed.result.error}`);
  }
  const publicKey = parsed.result.publicKey.valueBlock.valueHex;

  // remove 04
  return publicKey.slice(1);
}
