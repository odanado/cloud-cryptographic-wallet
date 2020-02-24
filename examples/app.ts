import Web3 from "web3";

import { KmsProvider } from "../src/provider";

async function main() {
  const region = "us-east-1";
  const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
  const endpoint =
    "https://ropsten.infura.io/v3/bd35010d62134981a9e82dff4708728b";

  const provider = new KmsProvider(endpoint, { region, keyId });
  const web3 = new Web3(provider as any);

  const accounts = await web3.eth.getAccounts();
  console.log(accounts);

  const to = "0xa802b07c1B5dd0e0E57911c3fB7911a7BCff6622";

  const receipt = await web3.eth.sendTransaction({
    from: accounts[0],
    to,
    value: web3.utils.toWei("0.01", "ether")
  });

  console.log(receipt);
}

main();
