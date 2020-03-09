import { mocked } from "ts-jest/utils";

import { Signature } from "./signature";
import { recover, toAddress } from "./crypto";
jest.mock("./crypto");

/*
jest.doMock("./crypto", () => ({
  recover: jest.fn(),
  toAddress: () => {
    return Buffer.alloc(2);
  }
}));
*/
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
      const r = Buffer.from("1".repeat(32));
      const s = Buffer.from("2".repeat(32));
      const v = 0;

      expect(() => {
        Signature.fromRSV(r, s, v);
      }).toThrow(/Signature: invalid signature. V must be 27 or 28./);
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
  });

  describe("accessors", () => {
    it("should be parse", () => {
      const r = Buffer.from("1".repeat(32));
      const s = Buffer.from("2".repeat(32));
      const v = 27;

      const signature = Signature.fromRSV(r, s, v);

      expect(signature.r).toEqual(r);
      expect(signature.s).toEqual(s);
      expect(signature.v).toEqual(v);
      expect(signature.recovery).toEqual(v);
    });
  });
});
