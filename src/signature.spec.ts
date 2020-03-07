import { Signature } from "./signature";

describe("Signature", () => {
  describe("when invalid length", () => {
    it("should be throw error", () => {
      expect(() => {
        new Signature(Buffer.alloc(64));
      }).toThrow(/Signature: invalid length/);
      expect(() => {
        new Signature(Buffer.alloc(66));
      }).toThrow(/Signature: invalid length/);
    });
  });
});
