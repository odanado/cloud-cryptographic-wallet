import { Signer } from "@cloud-cryptographic-wallet/signer";
import {
  createAsyncMiddleware,
  createScaffoldMiddleware,
  JsonRpcMiddleware,
} from "json-rpc-engine";

export type FromValidateMiddlewareOptions = {
  signers: Signer[];
};

function hasFrom(params: unknown): params is { from: string } {
  return params !== null && typeof params === "object" && "from" in params;
}

export function createFromValidateMiddleware(
  options: FromValidateMiddlewareOptions
): JsonRpcMiddleware<unknown, unknown> {
  return createScaffoldMiddleware({
    eth_sendTransaction: createAsyncMiddleware(async (req, _, next) => {
      if (!hasFrom(req.params)) {
        throw new Error("createFromValidateMiddleware: from is missing.");
      }

      const from = req.params.from;
      const { signers } = options;
      const addresses = await Promise.all(
        signers.map(async (signer) =>
          (await signer.getPublicKey()).toAddress().toString()
        )
      );

      if (
        addresses.every(
          (address) => address.toLowerCase() !== from.toLowerCase()
        )
      ) {
        throw new Error(
          `createFromValidateMiddleware: from is unknown address. actual: ${from}`
        );
      }

      return next();
    }),
  });
}
