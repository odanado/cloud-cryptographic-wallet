import { Hardfork, Common } from "@ethereumjs/common";
import { BN } from "ethereumjs-util";
import { query } from "./query.js";

export async function getCommon(rpcUrl: string): Promise<Common> {
  const chainId = await query<string>(rpcUrl, "eth_chainId", []);

  if (!chainId) {
    throw new Error("getCommon: can't get result of eth_chainId");
  }

  return Common.custom({
    chainId: new BN(chainId.slice(2), "hex").toNumber(),
    defaultHardfork: Hardfork.London,
  });
}
