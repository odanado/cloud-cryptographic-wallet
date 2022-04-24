import { test, expect } from "vitest";

import { getAccounts } from "./get-accounts.js";
import { SignerForTest } from "../../../test/test-utils/signer-for-test.js";

test("get addresses", async () => {
  const signers = [new SignerForTest(), new SignerForTest()];

  const addresses = await getAccounts(signers);

  expect(addresses[0]).toBe(
    (await signers[0].getPublicKey()).toAddress().toString()
  );
  expect(addresses[1]).toBe(
    (await signers[1].getPublicKey()).toAddress().toString()
  );
});
