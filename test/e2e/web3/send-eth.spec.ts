import { describe, it, expect } from "vitest";
import Web3 from "web3";
import crypto from "crypto";
import BN from "bn.js";

import { CloudKmsSigner } from "../../../packages/cloud-kms-signer";
import { AwsKmsSigner } from "../../../packages/aws-kms-signer";
import { createProvider } from "../../../packages/web3-provider-adapter";

const rpcUrl = "http://localhost:8501";

async function sendEth(from: string, to: string, value: string, web3: Web3) {
  const beforeFromBalance = await web3.eth.getBalance(from);
  const beforeToBalance = await web3.eth.getBalance(to);

  const receipt = await web3.eth.sendTransaction({
    from: from,
    to: to,
    value: value,
  });

  const afterFromBalance = await web3.eth.getBalance(from);
  const afterToBalance = await web3.eth.getBalance(to);

  return {
    beforeFromBalance: new BN(beforeFromBalance),
    beforeToBalance: new BN(beforeToBalance),
    afterFromBalance: new BN(afterFromBalance),
    afterToBalance: new BN(afterToBalance),
    cumulativeGasUsed: new BN(receipt.cumulativeGasUsed),
    effectiveGasPrice: new BN(receipt.effectiveGasPrice),
  };
}

async function prepare(rpcUrl: string, to: string) {
  const web3 = new Web3(rpcUrl);
  const accounts = await web3.eth.getAccounts();

  await sendEth(accounts[0], to, web3.utils.toWei("1", "ether"), web3);
}

describe("web3.js send-eth", () => {
  it.skip("CloudKmsSigner", async () => {
    const name =
      "projects/aws-kms-provider/locations/asia-northeast1/keyRings/for-e2e-test/cryptoKeys/for-e2e-test/cryptoKeyVersions/1";

    const cloudKmsSigner = new CloudKmsSigner(name);
    const provider = createProvider({ signers: [cloudKmsSigner], rpcUrl });
    const web3 = new Web3(provider as never);

    const accounts = await web3.eth.getAccounts();

    const target = crypto.randomBytes(20).toString("hex");

    await prepare(rpcUrl, accounts[0]);

    const value = web3.utils.toWei("0.1", "ether");
    const {
      beforeToBalance,
      afterToBalance,
      beforeFromBalance,
      afterFromBalance,
      cumulativeGasUsed,
      effectiveGasPrice,
    } = await sendEth(accounts[0], target, value, web3);

    const gas = cumulativeGasUsed.mul(effectiveGasPrice);

    expect(
      beforeFromBalance.sub(afterFromBalance).sub(gas).eq(new BN(value))
    ).toBeTruthy();

    expect(afterToBalance.sub(beforeToBalance).eq(new BN(value))).toBeTruthy();
  });

  it("AwsKmsSigner", async () => {
    const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
    const region = "us-east-1";
    const awsKmsSigner = new AwsKmsSigner(keyId, { region });

    const provider = createProvider({ signers: [awsKmsSigner], rpcUrl });
    const web3 = new Web3(provider as never);

    const accounts = await web3.eth.getAccounts();

    const target = crypto.randomBytes(20).toString("hex");

    await prepare(rpcUrl, accounts[0]);

    const value = web3.utils.toWei("0.1", "ether");
    const {
      beforeToBalance,
      afterToBalance,
      beforeFromBalance,
      afterFromBalance,
      cumulativeGasUsed,
      effectiveGasPrice,
    } = await sendEth(accounts[0], target, value, web3);

    const gas = cumulativeGasUsed.mul(effectiveGasPrice);

    expect(
      beforeFromBalance.sub(afterFromBalance).sub(gas).eq(new BN(value))
    ).toBeTruthy();

    expect(afterToBalance.sub(beforeToBalance).eq(new BN(value))).toBeTruthy();
  });
});
