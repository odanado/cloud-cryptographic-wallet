# aws-kms-signer

[![npm version](https://badge.fury.io/js/aws-kms-signer.svg)](https://www.npmjs.com/package/aws-kms-signer)

## Install

```bash
$ npm install aws-kms-signer
```

## Examples

```ts
import { KmsSigner } from "aws-kms-signer";

async function main() {
  const keyId = "xxxxx-xxxx-xxxx-xxxx-xxxxxxxx";
  const signer = new KmsSigner(keyId);

  console.log(await signer.getAddress());
}

main().catch((e) => console.error(e));
```
