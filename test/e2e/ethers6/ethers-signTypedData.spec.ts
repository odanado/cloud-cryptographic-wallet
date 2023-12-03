import { CloudKmsSigner } from "@packages/cloud-kms-signer/src/cloud-kms-signer";
import { EthersAdapter } from "@packages/ethers-adapter/src/ethers-adapter";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { describe, it, expect } from "vitest";
import testERC20Permit from "./contracts/erc20Permit.json";

dotenv.config();

describe("ethers.js CloudKmsSigner sign", () => {
  const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
  const cloudKmsSigner = new CloudKmsSigner(process.env.BCP_KMS_NAME as string);

  it("Can deploy a contract, and interact with the deployed contract", async () => {
    const cloudSigner = new EthersAdapter({ signer: cloudKmsSigner }, provider);
    const factory = new ethers.ContractFactory(
      testERC20Permit.abi,
      testERC20Permit.bytecode,
      cloudSigner
    );
    const contract = (await factory.deploy()) as ethers.Contract;
    await contract.waitForDeployment();
    console.log("contractAddress");
    console.log((await contract.getAddress()) as string);

    const sleep = (time: number) =>
      new Promise((resolve) => setTimeout(resolve, time));

    await sleep(60000);

    const TEST_ADDRESS1 = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const TEST_ADDRESS2 = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const holderAddress = TEST_ADDRESS1;
    const spenderAddress = TEST_ADDRESS2;
    const nonce = 1;
    const expiry = 0; // 任意の有効期限
    const domain = {
      name: "MyToken",
      version: "1.0.0",
      chainId: 80001, // Ethereum mainnet
      verifyingContract: await contract.getAddress(),
    };
    const types = {
      Transfer: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
      ],
    };
    const value = {
      from: TEST_ADDRESS1,
      to: TEST_ADDRESS2,
      value: ethers.parseEther("1.0"), // 1 ETH
    };
    console.log("creating signature");
    const signature = await cloudSigner.signTypedData(domain, types, value);
    console.log("finished creating signature");

    const signatureBytes = ethers.Signature.from(signature);

    console.log("sending transaction");
    const result = await contract.permit(
      holderAddress,
      spenderAddress,
      nonce,
      expiry,
      signatureBytes.v,
      signatureBytes.r,
      signatureBytes.s
    );
    console.log("Permit Result:", result);
  }, 400000);
  it("real signd typed data works", async () => {
    //public 0xe14c8cE4E8085e5560B7DB85e6E742AE4a24bE68
    const wallet = new ethers.Wallet(
      "0xd7602dd73fd247bd177117131583b4c0ba8ebaab32a0883ed7b1cf67b8826e76",
      provider
    );

    // contractAddress "0xe14c8cE4E8085e5560B7DB85e6E742AE4a24bE68"
    const contract = new ethers.Contract(
      "0xe14c8cE4E8085e5560B7DB85e6E742AE4a24bE68",
      testERC20Permit.abi,
      wallet
    );

    const TEST_ADDRESS1 = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const TEST_ADDRESS2 = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const holderAddress = TEST_ADDRESS1;
    const spenderAddress = TEST_ADDRESS2;
    const nonce = 1;
    const expiry = Math.floor(Date.now() / 1000) + 60 * 60;
    const domain = {
      name: "MyToken",
      version: "1.0.0",
      chainId: 80001, // Ethereum mainnet
      verifyingContract: "0xe14c8cE4E8085e5560B7DB85e6E742AE4a24bE68",
    };
    const types = {
      Transfer: [
        { name: "from", type: "address" },
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
      ],
    };
    const value = {
      from: TEST_ADDRESS1,
      to: TEST_ADDRESS2,
      value: ethers.parseEther("1.0"), // 1 ETH
    };
    console.log("creating signature");
    const signature = await wallet.signTypedData(domain, types, value);
    console.log("finished creating signature");

    const signatureBytes = ethers.Signature.from(signature);

    console.log("sending transaction");
    const result = await contract.permit(
      holderAddress,
      spenderAddress,
      nonce,
      expiry,
      signatureBytes.v,
      signatureBytes.r,
      signatureBytes.s
    );
    console.log("Permit Result:", result);
    expect(1).toBe(1);
  }, 400000);
  it.only("original signTypedData with a previously deployed contract works", async () => {
    const holderWallet = new ethers.Wallet(
      "0xaa28b9c38c2d5d10a5321f18d937aa4e89becc3b5eefc5bc9285e37429e3092d"
    );

    const contractAddress = "0x853724E15a359C0670515E653a43aC3B29b3b810";

    //public 0xe14c8cE4E8085e5560B7DB85e6E742AE4a24bE68
    const spenderWallet = new ethers.Wallet(
      "0xd7602dd73fd247bd177117131583b4c0ba8ebaab32a0883ed7b1cf67b8826e76",
      provider
    );

    const contract = new ethers.Contract(
      contractAddress,
      testERC20Permit.abi,
      spenderWallet
    );

    const nonce = await contract.nonces(holderWallet.address);

    console.log(`nonce ${nonce}`);
    const domain = {
      name: "MyToken",
      version: "1.0.0",
      chainId: 80001,
      verifyingContract: contractAddress,
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const amount = 10000;
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const value = {
      owner: holderWallet.address,
      spender: spenderWallet.address,
      value: amount,
      nonce,
      deadline,
    };

    console.log("creating signature");
    const signature = await holderWallet.signTypedData(domain, types, value);
    console.log("finished creating signature");

    const signatureBytes = ethers.Signature.from(signature);

    console.log("sending transaction");
    const result = await contract.permit(
      holderWallet.address,
      spenderWallet.address,
      amount,
      deadline,
      signatureBytes.v,
      signatureBytes.r,
      signatureBytes.s
    );
    console.log("Permit Result:", result);
    expect(1).toBe(1);
  }, 400000);
});
