export function getConfig(): {
  rpcUrl: string;
  region: string;
  keyId: string;
  privateKey: string;
} {
  const rpcUrl = process.env.RPC_URL;
  const region = "us-east-1";
  const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl) {
    throw new Error("RPC_URL not defined");
  }
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not defined");
  }

  return {
    rpcUrl,
    region,
    keyId,
    privateKey,
  };
}
