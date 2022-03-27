import { test, expect } from "vitest";

import { SignerForTest } from "../test-utils/signer-for-test.js";
import { lookupSigner } from "./lookup-signer.js";

const signers = [new SignerForTest(), new SignerForTest(), new SignerForTest()];

test("lookup signer", async () => {
  const address = (await signers[2].getPublicKey()).toAddress().toString();
  const signer = await lookupSigner(address, signers);

  expect(signer).toEqual(signers[2]);
});

test("not found", async () => {
  const unknownSigner = new SignerForTest();
  const address = (await unknownSigner.getPublicKey()).toAddress().toString();

  const signer = await lookupSigner(address, signers);

  expect(signer).toBeUndefined();
});
