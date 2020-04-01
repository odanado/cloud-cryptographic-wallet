import Web3 from "web3";

import { KmsProvider } from "../src/provider";

const region = "us-east-1";
const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
const endpoint =
  "https://ropsten.infura.io/v3/bd35010d62134981a9e82dff4708728b";
const to = "0xa802b07c1B5dd0e0E57911c3fB7911a7BCff6622";

async function main() {
  const provider = new KmsProvider(
    endpoint,
    { region, keyIds: [keyId] },
    "ropsten"
  );

  // XXX
  const web3 = new Web3(provider as any);

  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);
  const signature = await web3.eth.personal.sign("poyo", accounts[0], "pass");
  console.log(signature);
}

main().catch((e) => console.error(e));
