import type { createWalletMiddleware } from "eth-json-rpc-middleware";
import { query } from "../query.js";

type WalletMiddlewareOptions = Parameters<typeof createWalletMiddleware>[0];
type ProcessTransaction = NonNullable<
  WalletMiddlewareOptions["processTransaction"]
>;
type TransactionParams = Parameters<ProcessTransaction>[0];

export async function getGas(
  rpcUrl: string,
  txParams: TransactionParams
): Promise<string> {
  // XXX: eth-json-rpc-middleware doesn't expect params to be anything other than an array of strings
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const params: string[] = [txParams];
  const nonce = await query<string>(rpcUrl, "eth_estimateGas", params);

  if (!nonce) {
    throw new Error(
      `getGas: can't get result of eth_estimateGas. txParams is ${JSON.stringify(
        txParams
      )}`
    );
  }

  return nonce;
}
