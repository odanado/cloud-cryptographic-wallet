import { describe, it, expect } from "vitest";

import { Bytes } from "./bytes.js";

describe("Bytes", () => {
  describe("validate", () => {
    describe("when non hexadecimal number", () => {
      it("should be throw Error", () => {
        expect(() => Bytes.fromString("xy")).toThrow(
          /Bytes: string must be hexadecimal./
        );
      });
    });

    describe("when odd number of length", () => {
      it("should be throw Error", () => {
        expect(() => Bytes.fromString("abc")).toThrow(
          /Bytes: string must be an even number of length./
        );
      });
    });
  });

  describe.each(["0123456789abcdef", "0x0123456789abcdef"])(
    "fromString %s",
    (hex: string) => {
      it("should be create instance", () => {
        const bytes = Bytes.fromString(hex);

        expect(bytes.length).toBe(8);
        expect(bytes.toString()).toBe("0x0123456789abcdef");
      });
    }
  );

  describe("equals", () => {
    describe("when same string", () => {
      it("should be return true", () => {
        const bytes1 = Bytes.fromString("ab");
        const bytes2 = Bytes.fromString("ab");

        expect(bytes1.equals(bytes2)).toBeTruthy();
        expect(bytes2.equals(bytes1)).toBeTruthy();
      });
    });
    describe("when different string", () => {
      it("should be return true", () => {
        const bytes1 = Bytes.fromString("ab");
        const bytes2 = Bytes.fromString("cd");

        expect(bytes1.equals(bytes2)).toBeFalsy();
        expect(bytes2.equals(bytes1)).toBeFalsy();
      });
    });
  });
});
