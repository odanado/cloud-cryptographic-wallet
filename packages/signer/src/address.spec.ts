import { describe, it, expect } from "vitest";
import { Address } from "./address.js";
import { Bytes } from "./bytes.js";

describe("Address", () => {
  describe("toChecksumAddress", () => {
    it.each([
      "52908400098527886E0F7030069857D2E4169EE7",
      "8617E340B3D01FA5F11F306F4090FD50E238070D",
      "de709f2102306220921060314715629080e2fb77",
      "27b1fdb04752bbc536007a920d24acb045561c26",
      "5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      "fB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      "dbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
      "D1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
    ])("should be return correct address: %s", (testAddress) => {
      const address = Address.fromBytes(
        Bytes.fromString("52908400098527886E0F7030069857D2E4169EE7")
      );
      expect(address["toChecksumAddress"](testAddress.toLowerCase())).toBe(
        testAddress
      );
    });
  });

  describe("equals", () => {
    describe("when same address", () => {
      it("should be return true", () => {
        const addressBytes = Bytes.fromString(
          "52908400098527886E0F7030069857D2E4169EE7"
        );
        const address1 = Address.fromBytes(addressBytes);
        const address2 = Address.fromBytes(addressBytes);

        expect(address1.equals(address2)).toBeTruthy();
        expect(address2.equals(address1)).toBeTruthy();
      });
    });
    describe("when different address", () => {
      it("should be return false", () => {
        const addressBytes1 = Bytes.fromString(
          "52908400098527886E0F7030069857D2E4169EE7"
        );
        const addressBytes2 = Bytes.fromString(
          "8617E340B3D01FA5F11F306F4090FD50E238070D"
        );
        const address1 = Address.fromBytes(addressBytes1);
        const address2 = Address.fromBytes(addressBytes2);

        expect(address1.equals(address2)).toBeFalsy();
        expect(address2.equals(address1)).toBeFalsy();
      });
    });
  });

  describe("toString", () => {
    it("should be return string", () => {
      const address = Address.fromBytes(
        Bytes.fromString("52908400098527886E0F7030069857D2E4169EE7")
      );

      expect(address.toString()).toBe(
        "0x52908400098527886E0F7030069857D2E4169EE7"
      );
    });
  });

  describe("validation", () => {
    describe("when buffer.length isn't 20", () => {
      it("should be throw TypeError", () => {
        expect(() => Address.fromBytes(Bytes.fromString("0xab"))).toThrow(
          TypeError
        );
      });
    });
  });
});
