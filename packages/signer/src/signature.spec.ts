import { describe, it, expect } from "vitest";

import { Signature } from "./signature.js";

describe("Signature", () => {
  describe("validate", () => {
    describe("when buffer.length isn't 65", () => {
      it("should be throw TypeError", () => {
        expect(() => Signature.fromBuffer(Buffer.alloc(64))).toThrow(TypeError);
        expect(() => Signature.fromBuffer(Buffer.alloc(66))).toThrow(TypeError);
      });
    });
    describe("when S more than secp256k1halfN", () => {
      it("should be throw Error", () => {
        const buffer = Buffer.from(
          "638a54215d80a6713c8d523a6adc4e6e73652d859103a36b700851cb0e61b66b8ebfc1a610c57d732ec6e0a8f06a9a7a28df5051ece514702ff9cdff0b11f4541b",
          "hex"
        );

        expect(() => Signature.fromBuffer(buffer)).toThrow(
          /Signature: invalid signature. S must be less than or equal to secp256k1halfN./
        );
      });
    });
    describe("when V isn't 27 nor 28", () => {
      it("should be throw Error", () => {
        const buffer = Buffer.from(
          "98fa40a1e0fe7e210ca8290923343a3e2dccc83ccf87f88846f6f148a1e3af275db463cc8097b2210e288172710c43b7411bf21efcea7974a7f551095c427b0d1a",
          "hex"
        );

        expect(() => Signature.fromBuffer(buffer)).toThrow(
          /Signature: invalid signature. V must be 27 or 28./
        );
      });
    });
  });

  describe("accessors", () => {
    it("should be parse", () => {
      const r = Buffer.from("1".repeat(64), "hex");
      const s = Buffer.from("2".repeat(64), "hex");
      const v = Buffer.alloc(1);
      v.writeUInt8(27, 0);

      const buffer = Buffer.concat([r, s, v]);

      const signature = Signature.fromBuffer(buffer);

      expect(signature.r).toEqual(r);
      expect(signature.s).toEqual(s);
      expect(signature.v).toEqual(27);

      expect(signature.recovery).toEqual(0);
    });
  });
});
