import { ethers } from "ethers";
import { EthersAdapter } from "../packages/ethers-adapter/src/ethers-adapter";
import { CloudKmsSigner } from "../packages/cloud-kms-signer/src/cloud-kms-signer";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC);
  const cloudKmsSigner = new CloudKmsSigner(process.env.BCP_KMS_NAME as string);
  const cloudSigner = new EthersAdapter({ signer: cloudKmsSigner }, provider);
  const address = await cloudSigner.getAddress();
  console.log(`public key of gcp ksm is ${address}`);
};
main();
