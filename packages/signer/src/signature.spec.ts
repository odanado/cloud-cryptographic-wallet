import { describe, it, expect } from "vitest";

import { Bytes } from "./bytes.js";
import { PublicKey } from "./public-key.js";
import { Signature } from "./signature.js";

describe("Signature", () => {
  describe("validate", () => {
    describe("when buffer.length isn't 65", () => {
      it("should be throw TypeError", () => {
        expect(() => Signature.fromBytes(Bytes.fromString("0xab"))).toThrow(
          TypeError
        );
      });
    });
    describe("when S more than secp256k1halfN", () => {
      it("should be throw Error", () => {
        const bytes = Bytes.fromString(
          "638a54215d80a6713c8d523a6adc4e6e73652d859103a36b700851cb0e61b66b8ebfc1a610c57d732ec6e0a8f06a9a7a28df5051ece514702ff9cdff0b11f4541b"
        );

        expect(() => Signature.fromBytes(bytes)).toThrow(
          /Signature: invalid signature. S must be less than or equal to secp256k1halfN./
        );
      });
    });
    describe("when V isn't 27 nor 28", () => {
      it("should be throw Error", () => {
        const bytes = Bytes.fromString(
          "98fa40a1e0fe7e210ca8290923343a3e2dccc83ccf87f88846f6f148a1e3af275db463cc8097b2210e288172710c43b7411bf21efcea7974a7f551095c427b0d1a"
        );

        expect(() => Signature.fromBytes(bytes)).toThrow(
          /Signature: invalid signature. V must be 27 or 28./
        );
      });
    });
  });

  describe("accessors", () => {
    it("should be parse", () => {
      const r = Bytes.fromString("1".repeat(64));
      const s = Bytes.fromString("2".repeat(64));
      const v = Bytes.fromString("1b");

      const bytes = Bytes.concat([r, s, v]);

      const signature = Signature.fromBytes(bytes);

      expect(signature.r).toEqual(r);
      expect(signature.s).toEqual(s);
      expect(signature.v).toEqual(27);

      expect(signature.recovery).toEqual(0);
    });
  });

  describe("recoveryPublicKey", () => {
    it("should be recovery public key", () => {
      const publicKey = PublicKey.fromBytes(
        Bytes.fromString(
          "a4335a3a97ceacf35e0af44507bcc1b6298b9e011004144d09ed3ed553755e2ac70eb972ab28d1c4577192217fd41e3c6780536082f8de3d1de657c72678dc73"
        )
      );
      const hash = Bytes.fromString(
        "dcfaebe57bd0c3a358cd73d77252b8cebb7c9177f3274723c752c1e6aa88746a"
      );

      const signature = Signature.fromBytes(
        Bytes.fromString(
          "8e087614a0ca2ba341405577917aa7994f1f336a90546445af470b73638d3d9c3f9fee4335dd6b7be4b80e81ea3dfea3fe3de503f7deb016547e43df90fc307b1b"
        )
      );

      expect(signature.recoveryPublicKey(hash).equals(publicKey)).toBeTruthy();
    });
  });

  describe("fromHash", () => {
    describe("when V is 27", () => {
      it("return Signature", () => {
        const publicKey = PublicKey.fromBytes(
          Bytes.fromString(
            "a4335a3a97ceacf35e0af44507bcc1b6298b9e011004144d09ed3ed553755e2ac70eb972ab28d1c4577192217fd41e3c6780536082f8de3d1de657c72678dc73"
          )
        );
        const hash = Bytes.fromString(
          "dcfaebe57bd0c3a358cd73d77252b8cebb7c9177f3274723c752c1e6aa88746a"
        );

        const rs = Bytes.fromString(
          "8e087614a0ca2ba341405577917aa7994f1f336a90546445af470b73638d3d9c3f9fee4335dd6b7be4b80e81ea3dfea3fe3de503f7deb016547e43df90fc307b"
        );
        const r = rs.slice(0, 32);
        const s = rs.slice(32, 64);

        const signature = Signature.fromHash(hash, publicKey, r, s);

        expect(signature).toBeInstanceOf(Signature);
      });
    });
    describe("when V is 28", () => {
      it("return Signature", () => {
        const publicKey = PublicKey.fromBytes(
          Bytes.fromString(
            "1a035f583d7bddaf22080b052f2ad5fad56815c6dc5953bf21b67106443206f51d0066e558780dc27fade28fbd95ab24d043552a872c1d07956ad470d8c9348c"
          )
        );
        const hash = Bytes.fromString(
          "13a84ad0177dcdce4d808bbba737edd9395e939346b2c3acadafded1ad8d9a64"
        );

        const rs = Bytes.fromString(
          "3f39065d0162bf39aa996c0783addf2ef066f0e8d73aa7a3d65878ae38ff4cf668da0648c7d58c77748307e11d2553b4321fae8ede8923ed812f550fb7e02753"
        );
        const r = rs.slice(0, 32);
        const s = rs.slice(32, 64);

        const signature = Signature.fromHash(hash, publicKey, r, s);

        expect(signature).toBeInstanceOf(Signature);
      });
    });
  });
});
