import { describe, it, expect } from "vitest";
import { ethers } from "ethers";

import { EthersAdapter } from "../../../packages/ethers-adapter";
import { CloudKmsSigner } from "../../../packages/cloud-kms-signer";
import { AwsKmsSigner } from "../../../packages/aws-kms-signer";

async function sendEth(
  from: ethers.Signer,
  to: string,
  value: ethers.BigNumber,
  provider: ethers.providers.JsonRpcProvider
) {
  const beforeFromBalance = await from.getBalance();
  const beforeToBalance = await provider.getBalance(to);

  const tx = await from.sendTransaction({
    from: await from.getAddress(),
    to: to,
    value,
  });

  const receipt = await tx.wait();

  const afterFromBalance = await from.getBalance();
  const afterToBalance = await provider.getBalance(to);

  return {
    beforeFromBalance,
    beforeToBalance,
    afterFromBalance,
    afterToBalance,
    cumulativeGasUsed: receipt.cumulativeGasUsed,
    effectiveGasPrice: receipt.effectiveGasPrice,
  };
}

const rpcUrl = "http://localhost:8501";

const dummyAddress = "0x96d8fbe23dc200d75cc569a578d8ba6840e2f22f";

describe("ethers.js send-eth", () => {
  it.skip("CloudKmsSigner", async () => {
    const name =
      "projects/aws-kms-provider/locations/asia-northeast1/keyRings/for-e2e-test/cryptoKeys/for-e2e-test/cryptoKeyVersions/1";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const ethersSigner = await provider.getSigner();
    const cloudKmsSigner = new CloudKmsSigner(name);
    const cloudSigner = new EthersAdapter({ signer: cloudKmsSigner }).connect(
      provider
    );

    await sendEth(
      ethersSigner,
      await cloudSigner.getAddress(),
      ethers.utils.parseEther("1"),
      provider
    );

    const value = ethers.utils.parseEther("0.1");
    const {
      beforeToBalance,
      afterToBalance,
      beforeFromBalance,
      afterFromBalance,
      cumulativeGasUsed,
      effectiveGasPrice,
    } = await sendEth(cloudSigner, dummyAddress, value, provider);

    const gas = cumulativeGasUsed.mul(effectiveGasPrice);

    expect(
      beforeFromBalance.sub(afterFromBalance).sub(gas).eq(value)
    ).toBeTruthy();

    expect(afterToBalance.sub(beforeToBalance).eq(value)).toBeTruthy();
  });
  it("AwsKmsSigner", async () => {
    const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
    const region = "us-east-1";
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const ethersSigner = await provider.getSigner();
    const awsKmsSigner = new AwsKmsSigner(keyId, { region });
    const cloudSigner = new EthersAdapter({ signer: awsKmsSigner }).connect(
      provider
    );

    await sendEth(
      ethersSigner,
      await cloudSigner.getAddress(),
      ethers.utils.parseEther("1"),
      provider
    );

    const value = ethers.utils.parseEther("0.1");
    const {
      beforeToBalance,
      afterToBalance,
      beforeFromBalance,
      afterFromBalance,
      cumulativeGasUsed,
      effectiveGasPrice,
    } = await sendEth(cloudSigner, dummyAddress, value, provider);

    const gas = cumulativeGasUsed.mul(effectiveGasPrice);

    expect(
      beforeFromBalance.sub(afterFromBalance).sub(gas).eq(value)
    ).toBeTruthy();

    expect(afterToBalance.sub(beforeToBalance).eq(value)).toBeTruthy();
  });
});
