import { describe, it, expect } from "vitest";
import { assertKnownAddress } from "./assert-known-address.js";

describe("assertKnownAddress", () => {
  const from = "0x0a7943653138accf65145bbfdf3dfbc124267a61";
  const addresses = [
    "0xbba0631f67f6eff9d5a86052244ee477dd85b010",
    "0x137e74c5986e81a26e76a7fe47553fe2f1361b57",
    "0x569a6dc26ba89b30f94708fddc5b760ed5974eaf",
  ];

  describe("when pass to known address", () => {
    it("nothing", async () => {
      assertKnownAddress(from, [from, ...addresses]);
    });
  });
  describe("when pass to unknown address", () => {
    it("throw error", async () => {
      expect(() => assertKnownAddress(from, addresses)).toThrow(
        /from is unknown address/
      );
    });
  });
});
