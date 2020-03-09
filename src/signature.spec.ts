import { mocked } from "ts-jest/utils";

import { Signature } from "./signature";
import { recover, toAddress } from "./crypto";

jest.mock("./crypto");

describe("Signature", () => {
  describe("when invalid length", () => {
    it("should be throw error", () => {
      expect(() => {
        new Signature(Buffer.alloc(64));
      }).toThrow(/Signature: invalid signature. buffer length must be 65./);
      expect(() => {
        new Signature(Buffer.alloc(66));
      }).toThrow(/Signature: invalid signature. buffer length must be 65./);
    });
  });

  describe("when invalid V", () => {
    it("should be throw error", () => {
      const r = Buffer.from("1".repeat(64), "hex");
      const s = Buffer.from("2".repeat(64), "hex");
      const v = 0;

      expect(() => {
        Signature.fromRSV(r, s, v);
      }).toThrow(/Signature: invalid signature. V must be 27 or 28./);
    });
  });

  describe("compatible EIP2", () => {
    it("should be flip", () => {
      const r = Buffer.from("1".repeat(64), "hex");
      const s = Buffer.from("f".repeat(64), "hex");
      const v = 27;

      const signature = Signature.fromRSV(r, s, v);

      expect(signature.r).toEqual(r);
      expect(signature.s).not.toEqual(s);
      expect(signature.recovery).toBe(28);
    });
  });

  describe("fromDigest", () => {
    describe("when faild to solve V", () => {
      beforeEach(() => {
        mocked(recover).mockImplementation();
        mocked(toAddress).mockReturnValue(Buffer.alloc(2));
      });
      it("should be throw error", () => {
        expect(() =>
          Signature.fromDigest(
            Buffer.alloc(1),
            Buffer.alloc(2),
            Buffer.alloc(3),
            Buffer.alloc(4)
          )
        ).toThrow(/Signature: failed to solve V/);
      });
    });
    describe.each([0, 1])("when succeed to solve V", (v: number) => {
      let index = 0;
      const addresses = [
        Buffer.from("a".repeat(40)),
        Buffer.from("b".repeat(40))
      ];
      beforeEach(() => {
        mocked(recover).mockImplementation();
        mocked(toAddress).mockImplementation(() => {
          return addresses[index++];
        });
      });

      it("should be return Signature", () => {
        const r = Buffer.from("1".repeat(64), "hex");
        const s = Buffer.from("2".repeat(64), "hex");
        const signature = Signature.fromDigest(
          Buffer.from("f".repeat(40), "hex"),
          addresses[v],
          r,
          s
        );

        expect(signature.recovery).toBe(v + 27);
        expect(signature.r).toEqual(r);
        expect(signature.s).toEqual(s);
      });
    });
  });

  describe("accessors", () => {
    it("should be parse", () => {
      const r = Buffer.from("1".repeat(64), "hex");
      const s = Buffer.from("2".repeat(64), "hex");
      const v = 27;

      const signature = Signature.fromRSV(r, s, v);

      expect(signature.r).toEqual(r);
      expect(signature.s).toEqual(s);
      expect(signature.v).toEqual(v);
      expect(signature.recovery).toEqual(v);
    });
  });
});
