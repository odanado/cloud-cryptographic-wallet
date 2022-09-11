import { it, expect, beforeEach } from "vitest";
import Web3 from "web3";
import crypto from "crypto";

import { KmsProvider } from "../../../aws-kms-packages/aws-kms-provider";
import { getConfig } from "../../config";

const { region, keyId, rpcUrl } = getConfig();

beforeEach(async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const account = (await web3.eth.getAccounts())[0];

  const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });
  const accounts = await provider.getAccounts();

  await web3.eth.sendTransaction({
    from: account,
    to: accounts[0],
    value: web3.utils.toWei("1", "ether"),
    gas: 21000,
  });
});

it("web3.js", async () => {
  const target = crypto.randomBytes(20).toString("hex");
  const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });

  const web3 = new Web3(provider as any);
  const accounts = await web3.eth.getAccounts();

  const value = web3.utils.toWei("0.5", "ether");
  await web3.eth.sendTransaction({
    from: accounts[0],
    to: target,
    value,
  });

  await expect(web3.eth.getBalance(target)).resolves.toBe(value);
});
