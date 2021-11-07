import ethers from "ethers";

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

    const target = "0x75b130ed5e51b00cc7c5b91b1288c8d8e549f678";

    const value = ethers.utils.parseEther("0.5");

    const transaction = await signer.sendTransaction({
      to: target,
      value,
    });

    await transaction.wait();

    await expect(provider.getBalance(target)).resolves.toBe(value);
  });
});
