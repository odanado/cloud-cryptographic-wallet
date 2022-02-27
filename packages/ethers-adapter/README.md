# @cloud-cryptographic-wallet/ethers-adapter

This package allows you to use Signer of [ethers](https://docs.ethers.io/v5/) with a variety of cloud service key management systems.

## Support Cloud Services

- [AWS KMS](https://aws.amazon.com/kms/)
- [Cloud Key Management](https://cloud.google.com/security-key-management)

## Install

```bash
$ npm install @cloud-cryptographic-wallet/ethers-adapter ethers
```

## With Cloud Service

### AWS KMS

```bash
$ npm install @cloud-cryptographic-wallet/aws-kms-signer
```

```typescript
import { ethers } from "ethers";
import { AwsKmsSigner } from "@cloud-cryptographic-wallet/aws-kms-signer";
import { EthersAdapter } from "@cloud-cryptographic-wallet/ethers-adapter";

async function sendTxUsingAwsKmsSigner(rpcUrl: string) {
  const region = "us-east-1";
  const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
  const awsKmsSigner = new AwsKmsSigner(keyId, { region });

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new EthersAdapter({ signer: awsKmsSigner }).connect(provider);

  const address = await signer.getAddress();
  console.log(address);
  console.log(ethers.utils.formatEther(await signer.getBalance()));

  const tx = await signer.sendTransaction({
    from: address,
    to: address,
  });

  console.log({ tx });

  const receipt = await tx.wait();

  console.log({ receipt });
}
```

### Cloud Key Management

```bash
$ npm install @cloud-cryptographic-wallet/cloud-kms-signer
```

```typescript
import { ethers } from "ethers";
import { CloudKmsSigner } from "@cloud-cryptographic-wallet/cloud-kms-signer";
import { EthersAdapter } from "@cloud-cryptographic-wallet/ethers-adapter";

async function sendTxUsingCloudKmsSigner(rpcUrl: string) {
  const name =
    "projects/aws-kms-provider/locations/asia-northeast1/keyRings/for-e2e-test/cryptoKeys/for-e2e-test/cryptoKeyVersions/1";
  const cloudKmsSigner = new CloudKmsSigner(name);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new EthersAdapter({ signer: cloudKmsSigner }).connect(
    provider
  );

  const address = await signer.getAddress();
  console.log(address);
  console.log(ethers.utils.formatEther(await signer.getBalance()));

  const tx = await signer.sendTransaction({
    from: address,
    to: address,
  });

  console.log({ tx });

  const receipt = await tx.wait();

  console.log({ receipt });
}
```
