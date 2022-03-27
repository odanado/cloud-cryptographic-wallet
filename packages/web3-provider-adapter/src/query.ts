import fetch from "node-fetch";
import { createFetchConfigFromReq } from "eth-json-rpc-middleware";
import { JsonRpcResponse, JsonRpcSuccess } from "json-rpc-engine";
import { ethErrors } from "eth-rpc-errors";

type Maybe<T> = Partial<T> | null | undefined;

let nextRequestId: number;

export async function query<T = unknown>(
  rpcUrl: string,
  method: string,
  params: string[]
): Promise<Maybe<T>> {
  if (nextRequestId == undefined) {
    nextRequestId = 0;
  }
  const { fetchUrl, fetchParams } = createFetchConfigFromReq({
    rpcUrl,
    req: {
      method,
      params,
      id: nextRequestId++,
    },
  });

  const response = await fetch(fetchUrl, fetchParams);

  const body = (await response.json()) as JsonRpcResponse<T>;

  if ("error" in body && body.error) {
    throw ethErrors.rpc.internal({
      data: body.error,
    });
  }

  return (body as JsonRpcSuccess<T>).result;
}
