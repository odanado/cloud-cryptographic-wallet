import { recover, hash } from "./crypto";

describe("crypto", () => {
  describe("hash", () => {
    it("correct", () => {
      expect(hash(Buffer.from("poyo")).toString("hex")).toBe(
        "555f0ef7babe46115c6bdd149154e87ca707e60336bbcdf8a8d5219da24f56c5"
      );
    });
  });
  describe("recover", () => {
    it("correct", () => {
      const digest = Buffer.from(
        "fd57dc28891204c251c3854a0cca19c4feb5cc88db47626aabb8d40b64ae655d",
        "hex"
      );
      const r = Buffer.from(
        "a599eb53d251c52602d18f49ebbcd1c4254a502320de0697ee3025b91cc76ef8",
        "hex"
      );
      const s = Buffer.from(
        "535d1d1e06e76fdc343aa7d2699851b7b9c0a83925dc93c38173f081b4e8171b",
        "hex"
      );

      const publicKey = recover(digest, r, s, 0);
      expect(publicKey.toString("hex")).toBe(
        "19f46ae81adb78e842c41291394bea5c5815bda8cbe38952439f7f15ecffb43797cbdaa083ded50e1a1ae8d3971bc60bbfc7bfb80efcfc94c6d6e6ca9da5266c"
      );
    });
  });
});
