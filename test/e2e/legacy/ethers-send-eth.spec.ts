import crypto from "crypto";
import { describe, it, expect, beforeEach } from "vitest";
import * as ethers from "ethers";

import { KmsEthersSigner } from "../../../aws-kms-packages/aws-kms-ethers-signer";
import { getConfig } from "../../config";

const { region, keyId, rpcUrl } = getConfig();

describe("ethers", () => {
  beforeEach(async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = provider.getSigner();

    const signer = new KmsEthersSigner({ keyId, kmsClientConfig: { region } });

    await wallet.sendTransaction({
      to: await signer.getAddress(),
      value: ethers.utils.parseEther("1"),
    });
  });

  it("send eth", async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const signer = new KmsEthersSigner({
      keyId,
      kmsClientConfig: { region },
    }).connect(provider);

    const target = crypto.randomBytes(20).toString("hex");

    const value = ethers.utils.parseEther("0.5");

    const transaction = await signer.sendTransaction({
      to: target,
      value,
    });

    await transaction.wait();

    const actual = await provider.getBalance(target);
    expect(actual.eq(value)).toBeTruthy();
  });
});
