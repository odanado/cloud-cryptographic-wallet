import { JsonRpcEngine } from "json-rpc-engine";
import { createFetchMiddleware } from "eth-json-rpc-middleware";

import { Signer } from "@cloud-cryptographic-wallet/signer";

import { createWalletMiddlewareFromSigners } from "./middlewares/create-wallet-middleware-from-signers.js";

export type GetEngineOptions = {
  singers: Signer[];
  rpcUrl: string;
};

export function getEngine(options: GetEngineOptions): JsonRpcEngine {
  const engine = new JsonRpcEngine();

  engine.push(
    createWalletMiddlewareFromSigners(options.singers, options.rpcUrl)
  );

  engine.push(createFetchMiddleware({ rpcUrl: options.rpcUrl }));
  return engine;
}
