import * as ethers from "ethers";

import { KmsEthersSigner } from "../../packages/aws-kms-ethers-signer/src";
import { getConfig } from "../config";

const { region, keyId, rpcUrl, privateKey } = getConfig();

describe("ethers", () => {
  beforeEach(async () => {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey).connect(provider);

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

    const target = "0x9332b306f1215fe17533164eae8cae21d972bc37";

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
