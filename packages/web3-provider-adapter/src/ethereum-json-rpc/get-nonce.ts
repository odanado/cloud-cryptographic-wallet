import { query } from "../query.js";

export async function getNonce(rpcUrl: string, from: string): Promise<string> {
  const nonce = await query<string>(rpcUrl, "eth_getTransactionCount", [
    from,
    "pending",
  ]);

  if (!nonce) {
    throw new Error(
      `getNonce: can't get result of eth_getTransactionCount. from is ${from}`
    );
  }

  return nonce;
}
