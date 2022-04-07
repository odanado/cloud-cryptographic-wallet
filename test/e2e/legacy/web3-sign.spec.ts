import { it, expect } from "vitest";
import Web3 from "web3";

import { KmsProvider } from "../../../aws-kms-packages/aws-kms-provider";
import { getConfig } from "../../config";

const { region, keyId, rpcUrl } = getConfig();

it("web3.js", async () => {
  const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });

  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();

  const message = "poyo";
  const signature = await web3.eth.sign(message, accounts[0]);

  await expect(web3.eth.personal.ecRecover(message, signature)).resolves.toBe(
    accounts[0].toLowerCase()
  );
  expect(web3.eth.accounts.recover(message, signature)).toBe(accounts[0]);
});
