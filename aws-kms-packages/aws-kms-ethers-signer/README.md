# aws-kms-ethers-signer

[![npm version](https://badge.fury.io/js/aws-kms-ethers-signer.svg)](https://www.npmjs.com/package/aws-kms-ethers-signer)

## Install

```bash
$ npm install aws-kms-ethers-signer
```

## Examples

```ts
import * as ethers from "ethers";
import { KmsEthersSigner } from "aws-kms-ethers-signer";

async function main() {
  const rpcUrl = "http://localhost:8501";
  const keyId = "xxxxx-xxxx-xxxx-xxxx-xxxxxxxx";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new KmsEthersSigner({ keyId }).connect(provider);

  console.log(await signer.getAddress());
}

main().catch((e) => console.error(e));
```
