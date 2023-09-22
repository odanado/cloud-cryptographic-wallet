import { describe, it, expect } from "vitest";
import { ethers } from "ethers";
import { EthersAdapter } from "@packages/ethers-adapter/src/ethers-adapter";
import { CloudKmsSigner } from "@packages/cloud-kms-signer/src/cloud-kms-signer";
import dotenv from "dotenv";
import testERC721 from "./contracts/erc721.json";

dotenv.config();

describe("ethers.js CloudKmsSigner sign", () => {
  const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
  const cloudKmsSigner = new CloudKmsSigner(process.env.BCP_KMS_NAME as string);

  it("Can sign transaction and broadcast", async () => {
    const cloudSigner = new EthersAdapter({ signer: cloudKmsSigner }, provider);

    const toWallet = ethers.Wallet.createRandom();

    const tx = {
      to: toWallet.address,
      value: ethers.parseEther("0.001"),
      gasLimit: 1000000,
      nonce: await provider.getTransactionCount(
        await cloudSigner.getAddress(),
        "latest"
      ),
      chainId: 80001,
      type: 2,
      maxPriorityFeePerGas: ethers.parseUnits("34", "gwei").toString(),
      maxFeePerGas: ethers.parseUnits("35", "gwei").toString(),
    };

    const originalToBalance = Number(
      ethers.formatEther(await provider.getBalance(toWallet))
    );

    const signedTx = await cloudSigner.signTransaction(tx);

    const txResponse = await provider.broadcastTransaction(signedTx);

    await txResponse.wait();

    const afterToBalance = Number(
      ethers.formatEther(await provider.getBalance(toWallet))
    );

    expect(afterToBalance - originalToBalance).toBe(0.001);
  }, 100000);
  it("Throws if from address is not the signer's address.", async () => {
    const cloudSigner = new EthersAdapter({ signer: cloudKmsSigner }, provider);

    const toWallet = ethers.Wallet.createRandom();

    const tx = {
      from: ethers.Wallet.createRandom().address,
      to: toWallet.address,
      value: ethers.parseEther("0.001"),
      gasLimit: 1000000,
      nonce: await provider.getTransactionCount(
        await cloudSigner.getAddress(),
        "latest"
      ),
      chainId: 80001,
      type: 2,
      maxPriorityFeePerGas: ethers.parseUnits("34", "gwei").toString(),
      maxFeePerGas: ethers.parseUnits("35", "gwei").toString(),
    };

    await expect(cloudSigner.signTransaction(tx)).rejects.toThrow(
      // prefix match
      "transaction from address mismatch transaction.from"
    );
  }, 100000);
  it("Can deploy a contract, and interact with the deployed contract", async () => {
    const cloudSigner = new EthersAdapter({ signer: cloudKmsSigner }, provider);

    const factory = new ethers.ContractFactory(
      testERC721.abi,
      testERC721.bytecode,
      cloudSigner
    );

    const contract = (await factory.deploy()) as ethers.Contract;

    await contract.waitForDeployment();

    const cloudSignerAddress = await cloudSigner.getAddress();

    const tx = await contract.safeMint(cloudSignerAddress, 1);
    await tx.wait();

    expect(await contract.balanceOf(cloudSignerAddress)).toBe(
      ethers.toBigInt(1)
    );

    // check Contract class constructor too
    const testERC721Contract = new ethers.Contract(
      await contract.getAddress(),
      testERC721.abi,
      cloudSigner
    );

    expect(await testERC721Contract.balanceOf(cloudSignerAddress)).toBe(
      ethers.toBigInt(1)
    );
  }, 400000);
});
