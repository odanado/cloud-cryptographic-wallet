# aws-kms-provider

[![npm version](https://badge.fury.io/js/aws-kms-provider.svg)](https://www.npmjs.com/package/aws-kms-provider)

AWS KMS Web3 provider. The provider can sign the transaction using [Asymmetric Keys of AWS Key Management Service](https://docs.aws.amazon.com/kms/latest/developerguide/symmetric-asymmetric.html) without managing a private key.

## Install

```bash
$ npm install aws-kms-provider
```

## Another packages

|                                                                 |                                               |
| --------------------------------------------------------------- | --------------------------------------------- |
| [aws-kms-signer](aws-kms-packages/aws-kms-signer)               | Signer using AWS KMS without web3.js provider |
| [aws-kms-ethers-signer](aws-kms-packages/aws-kms-ethers-signer) | Signer for ethers.js                          |

## Examples

See [send-eth.ts](https://github.com/odanado/aws-kms-provider/blob/master/examples/send-eth.ts).

```ts
import Web3 from "web3";
import { KmsProvider } from "aws-kms-provider";

const region = "us-east-1";
const keyId = "xxxxx-xxxx-xxxx-xxxx-xxxxxxxx";
const endpoint = "https://ropsten.infura.io/v3/xxxxxxxxxxxx";
const to = "0xabcdef";

async function main() {
  const provider = new KmsProvider(endpoint, { region, keyIds: [keyId] });

  const web3 = new Web3(provider as any);

  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);

  const receipt = await web3.eth.sendTransaction({
    from: accounts[0],
    to,
    value: web3.utils.toWei("0.00001", "ether"),
  });

  console.log(receipt);
}

main().catch((e) => console.error(e));
```

## For Developer

### Release

```bash
$ yarn lerna publish
```

- Write a release note.

### Run e2e test in local

```bash
$ export AWS_PROFILE=xxx
$ ./scripts/prepare_e2e.sh yarn e2e
```
