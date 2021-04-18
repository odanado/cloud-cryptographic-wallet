import Web3 from "web3";

import { KmsProvider } from "../../src/";
import { getConfig } from "../config";

const { region, keyId, rpcUrl, privateKey } = getConfig();

beforeEach(async () => {
  console.log({ rpcUrl });
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });
  const accounts = await provider.getAccounts();

  await web3.eth.sendTransaction({
    from: account.address,
    to: accounts[0],
    value: web3.utils.toWei("1", "ether"),
  });
});

it("web3.js", async () => {
  const target = "0x75b130ed5e51b00cc7c5b91b1288c8d8e549f678";
  const provider = new KmsProvider(rpcUrl, { region, keyIds: [keyId] });

  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();

  const value = web3.utils.toWei("0.5", "ether");
  await web3.eth.sendTransaction({
    from: accounts[0],
    to: target,
    value,
  });

  await expect(web3.eth.getBalance(target)).resolves.toBe(value);
});
