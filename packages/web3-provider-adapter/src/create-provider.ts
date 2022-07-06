import { providerFromEngine } from "eth-json-rpc-middleware";

import { SafeEventEmitterProvider } from "../node_modules/eth-json-rpc-middleware/dist/types.js";

import { getEngine, GetEngineOptions } from "./get-engine.js";

export function createProvider(
  options: GetEngineOptions
): SafeEventEmitterProvider {
  const engine = getEngine(options);

  return providerFromEngine(engine);
}
