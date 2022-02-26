import { describe, it, expect } from "vitest";
import { Address } from "./address.js";
import { Bytes } from "./bytes.js";
import { PublicKey } from "./public-key.js";

describe("PublicKey", () => {
  describe("validate", () => {
    describe("when buffer.length isn't 64", () => {
      it("should be throw TypeError", () => {
        expect(() => PublicKey.fromBytes(Bytes.fromString("0xab"))).toThrow(
          TypeError
        );
      });
    });
  });

  describe("toAddress", () => {
    it("should be calculate address", () => {
      const bytes = Bytes.fromString(
        "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744"
      );
      const publicKey = PublicKey.fromBytes(bytes);
      expect(publicKey.toAddress()).toBeInstanceOf(Address);
      expect(publicKey.toAddress().toString()).toBe(
        "0x8e926dF9926746ba352F4d479Fb5DE47382e83bE"
      );
    });
  });

  describe("equals", () => {
    describe("when same public-key", () => {
      it("should be return true", () => {
        const bytes = Bytes.fromString(
          "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744"
        );
        const publicKey1 = PublicKey.fromBytes(bytes);
        const publicKey2 = PublicKey.fromBytes(bytes);

        expect(publicKey1.equals(publicKey2)).toBeTruthy();
        expect(publicKey2.equals(publicKey1)).toBeTruthy();
      });
    });
    describe("when different address", () => {
      it("should be return false", () => {
        const bytes1 = Bytes.fromString(
          "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744"
        );
        const bytes2 = Bytes.fromString(
          "377ada780e5cb7ddd628b02e5d1a9989ed8c0f83b81a4c2b4b861454367f8aade2fb2695b8480260ab6fdb8fd8db07cf6986aa789ce170e82d3fff9d31013982"
        );
        const publicKey1 = PublicKey.fromBytes(bytes1);
        const publicKey2 = PublicKey.fromBytes(bytes2);

        expect(publicKey1.equals(publicKey2)).toBeFalsy();
        expect(publicKey2.equals(publicKey1)).toBeFalsy();
      });
    });
  });
});
