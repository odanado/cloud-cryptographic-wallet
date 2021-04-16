# aws-kms-provider

[![npm version](https://badge.fury.io/js/aws-kms-provider.svg)](https://www.npmjs.com/package/aws-kms-provider)
[![GitHub Actions](https://github.com/odanado/aws-kms-provider/workflows/Node%20CI/badge.svg)](https://github.com/odanado/aws-kms-provider)
[![Coverage Status](https://coveralls.io/repos/github/odanado/aws-kms-provider/badge.svg?branch=add-coveralls)](https://coveralls.io/github/odanado/aws-kms-provider?branch=add-coveralls)

AWS KMS Web3 provider. The provider can sign the transaction using [Asymmetric Keys of AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/symmetric-asymmetric.html) without managing a private key.



## Install
```bash
$ npm install aws-kms-provider aws-sdk
```

## Examples
See [send-eth.ts](https://github.com/odanado/aws-kms-provider/blob/master/examples/send-eth.ts).

```ts
import Web3 from "web3";
import { KmsProvider } from ".aws-kms-provider";

const region = "us-east-1";
const keyId = "xxxxx-xxxx-xxxx-xxxx-xxxxxxxx";
const endpoint =
  "https://ropsten.infura.io/v3/xxxxxxxxxxxx";
const to = "0xabcdef";

async function main() {
  const provider = new KmsProvider(
    endpoint,
    { region, keyIds: [keyId] }
  );

  const web3 = new Web3(provider as any);

  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);

  const receipt = await web3.eth.sendTransaction({
    from: accounts[0],
    to,
    value: web3.utils.toWei("0.00001", "ether")
  });

  console.log(receipt);
}

main().catch(e => console.error(e));
```


## For Developer
### Release


```bash
$ yarn publish
$ git push origin HEAD
```

- Write a release note.
  - https://github.com/odanado/aws-kms-provider/releases/new