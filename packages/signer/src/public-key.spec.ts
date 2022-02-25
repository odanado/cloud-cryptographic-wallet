import { describe, it, expect } from "vitest";
import { Address } from "./address.js";
import { PublicKey } from "./public-key.js";

describe("PublicKey", () => {
  describe("validate", () => {
    describe("when buffer.length isn't 64", () => {
      it("should be throw TypeError", () => {
        expect(() => PublicKey.fromBuffer(Buffer.alloc(63))).toThrow(TypeError);
        expect(() => PublicKey.fromBuffer(Buffer.alloc(65))).toThrow(TypeError);
      });
    });
  });

  describe("toAddress", () => {
    it("should be calculate address", () => {
      const buffer = Buffer.from(
        "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
        "hex"
      );
      const publicKey = PublicKey.fromBuffer(buffer);
      expect(publicKey.toAddress()).toBeInstanceOf(Address);
      expect(publicKey.toAddress().toString()).toBe(
        "0x8e926dF9926746ba352F4d479Fb5DE47382e83bE"
      );
    });
  });

  describe("equals", () => {
    describe("when same public-key", () => {
      it("should be return true", () => {
        const buffer = Buffer.from(
          "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
          "hex"
        );
        const publicKey1 = PublicKey.fromBuffer(buffer);
        const publicKey2 = PublicKey.fromBuffer(buffer);

        expect(publicKey1.equals(publicKey2)).toBeTruthy();
        expect(publicKey2.equals(publicKey1)).toBeTruthy();
      });
    });
    describe("when different address", () => {
      it("should be return false", () => {
        const buffer1 = Buffer.from(
          "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
          "hex"
        );
        const buffer2 = Buffer.from(
          "377ada780e5cb7ddd628b02e5d1a9989ed8c0f83b81a4c2b4b861454367f8aade2fb2695b8480260ab6fdb8fd8db07cf6986aa789ce170e82d3fff9d31013982",
          "hex"
        );
        const publicKey1 = PublicKey.fromBuffer(buffer1);
        const publicKey2 = PublicKey.fromBuffer(buffer2);

        expect(publicKey1.equals(publicKey2)).toBeFalsy();
        expect(publicKey2.equals(publicKey1)).toBeFalsy();
      });
    });
  });
});
