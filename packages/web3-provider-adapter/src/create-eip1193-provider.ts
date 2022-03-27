import { EIP1193Provider } from "eip1193-provider";

import { getEngine, GetEngineOptions } from "./get-engine.js";
import { eip1193ProviderFromEngine } from "./eip1193-provider-from-engine.js";

export function createEip1193Provider(
  options: GetEngineOptions
): EIP1193Provider {
  const engine = getEngine(options);

  return eip1193ProviderFromEngine(engine);
}
