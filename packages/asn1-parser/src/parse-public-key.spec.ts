import { describe, it, expect } from "vitest";

import { Bytes, PublicKey, Address } from "@cloud-cryptographic-wallet/signer";

import { parsePublicKey } from "./parse-public-key.js";

describe("parsePublicKey", () => {
  it("should be parse (AWS KMS)", () => {
    const bytes = Bytes.fromString(
      "3056301006072a8648ce3d020106052b8104000a034200046ce651c2445abd0915d97b683ff35cc6de4c340b8759918fd34cacf4395c39b0e2ad7517c9ab585ed5213ef0c00a1896f390eb03ff1ef8a13e18f036fa62a9e4"
    );

    const publicKey = parsePublicKey(bytes.buffer);

    const expected = Address.fromBytes(
      Bytes.fromString("0b45ff0aea02cb12b8923743ecebc83fe437c614")
    );

    expect(
      expected.equals(
        PublicKey.fromBytes(Bytes.fromArrayBuffer(publicKey)).toAddress()
      )
    );
  });

  it("should be parse (Cloud KMS)", () => {
    const bytes = Bytes.fromString(
      "3056301006072a8648ce3d020106052b8104000a03420004d4f664a42f91df474e4e97549f773a187ed85f93af9fc4053a29961d9c810ea33c8894a313631c7eee83916ef32ad5dbc321f06b1d600f039eee22488d6b48d1"
    );

    const publicKey = parsePublicKey(bytes.buffer);

    const expected = Address.fromBytes(
      Bytes.fromString("0x9f60980a13f74d79214e258d2f52fd846a3a5511")
    );

    expect(
      expected.equals(
        PublicKey.fromBytes(Bytes.fromArrayBuffer(publicKey)).toAddress()
      )
    );
  });
});
