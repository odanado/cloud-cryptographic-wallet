import { EIP1193Provider } from "eip1193-provider";
import { JsonRpcEngine } from "json-rpc-engine";
import SafeEventEmitterOriginal from "@metamask/safe-event-emitter";
import { interopImportCJSDefault } from "node-cjs-interop";

const SafeEventEmitter = interopImportCJSDefault(SafeEventEmitterOriginal);

export function eip1193ProviderFromEngine(
  engine: JsonRpcEngine
): EIP1193Provider {
  let nextRequestId = 0;
  const eventEmitter = new SafeEventEmitter();

  const provider: EIP1193Provider = {
    ...eventEmitter,
    request(args) {
      return new Promise((resolve, reject) => {
        engine.handle(
          {
            method: args.method,
            id: nextRequestId++,
            jsonrpc: "2.0",
            params: args.params,
          },
          (error, response) => {
            if (error) {
              reject(error);
              return;
            }

            if ("error" in response) {
              reject(response.error);
              return;
            }

            resolve(response.result);
          }
        );
      });
    },
  };

  return provider;
}
