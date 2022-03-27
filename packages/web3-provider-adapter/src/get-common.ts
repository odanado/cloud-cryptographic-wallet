import CommonOriginal, { Hardfork } from "@ethereumjs/common";
import type { default as CommonType } from "@ethereumjs/common";
import { BN } from "ethereumjs-util";
import { interopImportCJSDefault } from "node-cjs-interop";
import { query } from "./query.js";

const Common = interopImportCJSDefault(CommonOriginal);

export async function getCommon(rpcUrl: string): Promise<CommonType> {
  const chainId = await query<string>(rpcUrl, "eth_chainId", []);

  if (!chainId) {
    throw new Error("getCommon: can't get result of eth_chainId");
  }

  return Common.custom({
    chainId: new BN(chainId.slice(2), "hex"),
    defaultHardfork: Hardfork.London,
  });
}
