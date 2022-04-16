# @cloud-cryptographic-wallet/web3-provider-adapter

[![npm version](https://badge.fury.io/js/@cloud-cryptographic-wallet%2Fweb3-provider-adapter.svg)](https://badge.fury.io/js/@cloud-cryptographic-wallet%2Fweb3-provider-adapter)

This package allows you to use provider of [web3.js](https://web3js.readthedocs.io/) with a variety of cloud service key management systems.

## Support Cloud Services

- [AWS KMS](https://aws.amazon.com/kms/)
- [Cloud Key Management](https://cloud.google.com/security-key-management)

## Install

```bash
$ npm install @cloud-cryptographic-wallet/web3-provider-adapter web3
```

## With Cloud Service

### AWS KMS

```bash
$ npm install @cloud-cryptographic-wallet/aws-kms-signer
```

```typescript
import Web3 from "web3";
import { AwsKmsSigner } from "@cloud-cryptographic-wallet/aws-kms-signer";
import { createProvider } from "@cloud-cryptographic-wallet/web3-provider-adapter";

async function sendTxUsingAwsKmsSigner(rpcUrl: string) {
  const region = "us-east-1";
  const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
  const awsKmsSigner = new AwsKmsSigner(keyId, { region });

  const provider = createProvider({ signers: [awsKmsSigner], rpcUrl });
  const web3 = new Web3(provider as any);

  const address = (await web3.eth.getAccounts())[0];
  console.log(address);
  if (!address) {
    return;
  }

  const tx = await web3.eth.sendTransaction({
    from: address,
    to: address,
  });

  console.log({ tx });
}
```

### Cloud Key Management

```bash
$ npm install @cloud-cryptographic-wallet/cloud-kms-signer
```

```typescript
import Web3 from "web3";
import { CloudKmsSigner } from "@cloud-cryptographic-wallet/cloud-kms-signer";
import { createProvider } from "@cloud-cryptographic-wallet/web3-provider-adapter";

async function sendTxUsingCloudKmsSigner(rpcUrl: string) {
  const name =
    "projects/aws-kms-provider/locations/asia-northeast1/keyRings/for-e2e-test/cryptoKeys/for-e2e-test/cryptoKeyVersions/1";
  const cloudKmsSigner = new CloudKmsSigner(name);

  const provider = createProvider({ signers: [cloudKmsSigner], rpcUrl });
  const web3 = new Web3(provider as any);

  const address = (await web3.eth.getAccounts())[0];
  console.log(address);
  if (!address) {
    return;
  }

  const tx = await web3.eth.sendTransaction({
    from: address,
    to: address,
  });

  console.log({ tx });
}
```
