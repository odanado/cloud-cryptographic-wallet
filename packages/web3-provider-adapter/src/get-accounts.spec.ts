import { test, expect } from "vitest";

import { getAccounts } from "./get-accounts.js";
import { SignerForTest } from "../../../test/test-utils/signer-for-test.js";

test("get addresses", async () => {
  const singers = [new SignerForTest(), new SignerForTest()];

  const addresses = await getAccounts(singers);

  expect(addresses[0]).toBe(
    (await singers[0].getPublicKey()).toAddress().toString()
  );
  expect(addresses[1]).toBe(
    (await singers[1].getPublicKey()).toAddress().toString()
  );
});
