import fetch from "node-fetch";
import { createFetchConfigFromReq } from "eth-json-rpc-middleware";
import { JsonRpcResponse, JsonRpcSuccess } from "json-rpc-engine";

type Maybe<T> = Partial<T> | null | undefined;

export async function query<T = unknown>(
  rpcUrl: string,
  method: string,
  params: string[]
): Promise<Maybe<T>> {
  const { fetchUrl, fetchParams } = createFetchConfigFromReq({
    rpcUrl,
    req: {
      method,
      params,
      id: 42,
    },
  });

  const response = await fetch(fetchUrl, fetchParams);

  const body = (await response.json()) as JsonRpcResponse<T>;

  if ("error" in body && body.error) {
    return Promise.reject(body.error);
  }

  return (body as JsonRpcSuccess<T>).result;
}
