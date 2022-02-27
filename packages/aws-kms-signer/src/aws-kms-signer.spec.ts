import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  Bytes,
  PublicKey,
  Signature,
} from "@cloud-cryptographic-wallet/signer";
import {
  KMSClient,
  GetPublicKeyCommandOutput,
  GetPublicKeyCommand,
  SignCommandOutput,
  SignCommand,
} from "@aws-sdk/client-kms";

import { AwsKmsSigner } from "./aws-kms-signer.js";
import exp from "constants";

function mockSendFunction(
  client: KMSClient,
  getPublicKeyCommandOutput: Partial<GetPublicKeyCommandOutput> | undefined,
  signCommandOutput: Partial<SignCommandOutput> | undefined
) {
  const spy = vi.spyOn(client, "send");

  spy.mockImplementation((command) => {
    if (command instanceof GetPublicKeyCommand && getPublicKeyCommandOutput) {
      return getPublicKeyCommandOutput;
    }
    if (command instanceof SignCommand && signCommandOutput) {
      return signCommandOutput;
    }
  });

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

      const spy = mockSendFunction(
        awsKmsSigner["client"],
        {
          PublicKey: publicKeyResponse.asUint8Array,
        },
        undefined
      );

      const actual = await awsKmsSigner.getPublicKey();

      expect(publicKey.equals(actual)).toBeTruthy();

      const actual2 = await awsKmsSigner.getPublicKey();
      expect(publicKey.equals(actual2)).toBeTruthy();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    describe("when response.PublicKey is undefined", () => {
      it("should be throw Error", async () => {
        const spy = mockSendFunction(
          awsKmsSigner["client"],
          {
            PublicKey: undefined,
          },
          undefined
        );

        await expect(awsKmsSigner.getPublicKey()).rejects.toThrow(
          /AwsKmsSigner: PublicKey is undefined./
        );

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("sign", () => {
    it("should be return signature", async () => {
      const hash = Bytes.fromString(
        "8f5c4a30797ff58826711013473057e15ab305046fc5d2f76699769ed30d40f6"
      );

      const publicKeyResponse = Bytes.fromString(
        "3056301006072a8648ce3d020106052b8104000a034200046ce651c2445abd0915d97b683ff35cc6de4c340b8759918fd34cacf4395c39b0e2ad7517c9ab585ed5213ef0c00a1896f390eb03ff1ef8a13e18f036fa62a9e4"
      );
      const signatureResponse = Bytes.fromString(
        "304502202b0b04d3f640a3fd5dcac0d5b0803947961e40fda3bb34252f504a80f9d045d802210080805630a7866b7fcd125942676936bdca09b762d3472a5ada590887b519ef15"
      );

      const spy = mockSendFunction(
        awsKmsSigner["client"],
        {
          PublicKey: publicKeyResponse.asUint8Array,
        },
        { Signature: signatureResponse.asUint8Array }
      );

      const signature = await awsKmsSigner.sign(hash);

      expect(signature).toBeInstanceOf(Signature);
      expect(
        signature.bytes.equals(
          Bytes.fromString(
            "2b0b04d3f640a3fd5dcac0d5b0803947961e40fda3bb34252f504a80f9d045d87f7fa9cf5879948032eda6bd9896c940f0a52583dc0175e0e57956051b1c522c1c"
          )
        )
      );
      expect(spy).toHaveBeenCalledTimes(2);
    });

    describe("when response.Signature is undefined", () => {
      it("should be throw Error", async () => {
        const hash = Bytes.fromString(
          "8f5c4a30797ff58826711013473057e15ab305046fc5d2f76699769ed30d40f6"
        );

        const spy = mockSendFunction(
          awsKmsSigner["client"],
          {
            PublicKey: undefined,
          },
          { Signature: undefined }
        );

        await expect(awsKmsSigner.sign(hash)).rejects.toThrow(
          /AwsKmsSigner: Signature is undefined./
        );

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
