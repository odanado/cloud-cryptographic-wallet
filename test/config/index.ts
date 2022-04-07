export function getConfig(): {
  rpcUrl: string;
  region: string;
  keyId: string;
} {
  const rpcUrl = process.env.RPC_URL;
  const region = "us-east-1";
  const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";

  if (!rpcUrl) {
    throw new Error("RPC_URL not defined");
  }

  return {
    rpcUrl,
    region,
    keyId,
  };
}
