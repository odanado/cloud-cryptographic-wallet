import { Address } from "./address";

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
      const dummy = Buffer.from(
        "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
        "hex"
      );
      const address = Address.fromPublicKey(dummy);
      expect(address["toChecksumAddress"](testAddress.toLowerCase())).toBe(
        testAddress
      );
    });
  });

  describe("fromPublicKey", () => {
    it("should be calculate address", () => {
      const publicKey = Buffer.from(
        "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
        "hex"
      );
      const address = Address.fromPublicKey(publicKey);
      expect(address.toString()).toBe(
        "8e926dF9926746ba352F4d479Fb5DE47382e83bE"
      );
    });
    describe("when invalid public key", () => {
      it("should be throw error", () => {
        const publicKey = Buffer.from("abc", "hex");
        expect(() => Address.fromPublicKey(publicKey)).toThrow(
          /Address: invalid public key/
        );
      });
    });
  });

  describe("equals", () => {
    describe("when same address", () => {
      const publicKey = Buffer.from(
        "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
        "hex"
      );
      const address1 = Address.fromPublicKey(publicKey);
      const address2 = Address.fromPublicKey(publicKey);

      expect(address1.equals(address2)).toBeTruthy();
      expect(address2.equals(address1)).toBeTruthy();
    });
    describe("when different address", () => {
      const publicKey1 = Buffer.from(
        "20d55983d1707ff6e9ce32d583ad0f7acb3b0beb601927c4ff05f780787f377afe463d329f4535c82457f87df56d0a70e16a9442c6ff6d59b8f113d6073e9744",
        "hex"
      );
      const publicKey2 = Buffer.from(
        "377ada780e5cb7ddd628b02e5d1a9989ed8c0f83b81a4c2b4b861454367f8aade2fb2695b8480260ab6fdb8fd8db07cf6986aa789ce170e82d3fff9d31013982",
        "hex"
      );
      const address1 = Address.fromPublicKey(publicKey1);
      const address2 = Address.fromPublicKey(publicKey2);

      expect(address1.equals(address2)).toBeFalsy();
      expect(address2.equals(address1)).toBeFalsy();
    });
  });
});
