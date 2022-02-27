import { describe, expect, it, vi, beforeEach } from "vitest";

import { KeyManagementServiceClient, protos } from "@google-cloud/kms";

import { CloudKmsSigner } from "./cloud-kms-signer.js";
import { Bytes, PublicKey } from "@cloud-cryptographic-wallet/signer";

function mockGetPublicKey(
  client: KeyManagementServiceClient,
  publicKeyResponse?: Partial<protos.google.cloud.kms.v1.IPublicKey>
) {
  const pem =
    "-----BEGIN PUBLIC KEY-----\n" +
    "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE1PZkpC+R30dOTpdUn3c6GH7YX5Ovn8QF\n" +
    "OimWHZyBDqM8iJSjE2Mcfu6DkW7zKtXbwyHwax1gDwOe7iJIjWtI0Q==\n" +
    "-----END PUBLIC KEY-----\n";
  const spy = vi.spyOn(client, "getPublicKey");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  spy.mockResolvedValue([
    {
      name: "keyName",
      pem,
      pemCrc32c: { value: "4077715619" },
      ...publicKeyResponse,
    },
  ]);

  return spy;
}

function mockAsymmetricSign(
  client: KeyManagementServiceClient,
  signatureResponse?: Partial<protos.google.cloud.kms.v1.IAsymmetricSignResponse>
) {
  const spy = vi.spyOn(client, "asymmetricSign");

  const signature = Bytes.fromString(
    "3045022100f66b26e8370aead7cab0fedd9650705be79be165ba807b5e2d1b18030d726d2302204e77b43a05c5901c38ed60957bc38dadea4a6b91837815f197a520871fa53e72"
  );

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  spy.mockResolvedValue([
    {
      signature: signature.asUint8Array,
      signatureCrc32c: { value: "3151495169" },
      ...signatureResponse,
    },
  ]);

  return spy;
}

describe("CloudKmsSigner", () => {
  let cloudKmsSigner: CloudKmsSigner;

  beforeEach(() => {
    cloudKmsSigner = new CloudKmsSigner("keyName");
  });

  describe("getPublicKey", () => {
    it("should be return public key", async () => {
      mockGetPublicKey(cloudKmsSigner["client"]);
      const publicKey = await cloudKmsSigner.getPublicKey();

      const expected = PublicKey.fromBytes(
        Bytes.fromString(
          "0xd4f664a42f91df474e4e97549f773a187ed85f93af9fc4053a29961d9c810ea33c8894a313631c7eee83916ef32ad5dbc321f06b1d600f039eee22488d6b48d1"
        )
      );
      expect(expected.equals(publicKey)).toBeTruthy();
    });

    describe("when incorrect crc32c value", () => {
      it("should be throw Error", async () => {
        mockGetPublicKey(cloudKmsSigner["client"], {
          pemCrc32c: { value: "42" },
        });

        await expect(cloudKmsSigner.getPublicKey()).rejects.toThrow(
          /CloudKmsSigner: failed to validate of crc32c publicKeyResponse.pem./
        );
      });
    });
  });

  describe("sign", () => {
    it("should be return signature", async () => {
      const hash = Bytes.fromString(
        "0x8f5c4a30797ff58826711013473057e15ab305046fc5d2f76699769ed30d40f6"
      );
      mockGetPublicKey(cloudKmsSigner["client"]);
      mockAsymmetricSign(cloudKmsSigner["client"]);

      const expected = Bytes.fromString(
        "0xf66b26e8370aead7cab0fedd9650705be79be165ba807b5e2d1b18030d726d234e77b43a05c5901c38ed60957bc38dadea4a6b91837815f197a520871fa53e721c"
      );
      const signature = await cloudKmsSigner.sign(hash);

      expect(expected.equals(signature.bytes)).toBeTruthy();
    });

    describe("when incorrect crc32c value", () => {
      it("should be throw Error", async () => {
        const hash = Bytes.fromString(
          "0x8f5c4a30797ff58826711013473057e15ab305046fc5d2f76699769ed30d40f6"
        );
        mockGetPublicKey(cloudKmsSigner["client"]);
        mockAsymmetricSign(cloudKmsSigner["client"], {
          signatureCrc32c: { value: "42" },
        });

        await expect(cloudKmsSigner.sign(hash)).rejects.toThrow(
          /CloudKmsSigner: failed to validate of crc32c signResponse.signature./
        );
      });
    });
  });
});
