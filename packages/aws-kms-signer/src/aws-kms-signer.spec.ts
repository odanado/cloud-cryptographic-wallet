import { describe, expect, it, vi, beforeEach } from "vitest";

import { Bytes, PublicKey } from "@cloud-cryptographic-wallet/signer";
import { KMSClient, GetPublicKeyCommandOutput } from "@aws-sdk/client-kms";

import { AwsKmsSigner } from "./aws-kms-signer.js";

function mockGetPublicKeyCommand(
  client: KMSClient,
  output: Partial<GetPublicKeyCommandOutput>
) {
  const spy = vi.spyOn(client, "send");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  spy.mockResolvedValue(output);

  return spy;
}

describe("AwsKmsSigner", () => {
  let awsKmsSigner: AwsKmsSigner;

  beforeEach(() => {
    awsKmsSigner = new AwsKmsSigner("keyId");
  });

  describe("getPublicKey", () => {
    it("should be return public key", async () => {
      const publicKeyResponse = Bytes.fromString(
        "3056301006072a8648ce3d020106052b8104000a034200046ce651c2445abd0915d97b683ff35cc6de4c340b8759918fd34cacf4395c39b0e2ad7517c9ab585ed5213ef0c00a1896f390eb03ff1ef8a13e18f036fa62a9e4"
      );
      const publicKey = PublicKey.fromBytes(
        Bytes.fromString(
          "6ce651c2445abd0915d97b683ff35cc6de4c340b8759918fd34cacf4395c39b0e2ad7517c9ab585ed5213ef0c00a1896f390eb03ff1ef8a13e18f036fa62a9e4"
        )
      );

      const spy = mockGetPublicKeyCommand(awsKmsSigner["client"], {
        PublicKey: publicKeyResponse.asUint8Array,
      });

      const actual = await awsKmsSigner.getPublicKey();

      expect(publicKey.equals(actual)).toBeTruthy();

      const actual2 = await awsKmsSigner.getPublicKey();
      expect(publicKey.equals(actual2)).toBeTruthy();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    describe("when response.PublicKey is undefined", () => {
      it("should be throw Error", async () => {
        const spy = mockGetPublicKeyCommand(awsKmsSigner["client"], {
          PublicKey: undefined,
        });

        await expect(awsKmsSigner.getPublicKey()).rejects.toThrow(
          /AwsKmsSigner: PublicKey is undefined./
        );

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
