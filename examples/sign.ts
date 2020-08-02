import Web3 from "web3";

import { KmsProvider } from "../src/provider";

const region = "us-east-1";
const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
const endpoint =
  "https://ropsten.infura.io/v3/bd35010d62134981a9e82dff4708728b";

async function main() {
  const provider = new KmsProvider(endpoint, { region, keyIds: [keyId] });

  // XXX
  const web3 = new Web3(provider as any);

  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);

  const message = "Poyo";

  const digest = web3.utils.sha3("poyo");

  // XXX
  const signature = await web3.eth.sign(message, accounts[0]);

  console.log(signature);

  console.log(await web3.eth.personal.ecRecover(message, signature));
  console.log(await web3.eth.accounts.recover(message, signature));
}

main().catch((e) => console.error(e));
