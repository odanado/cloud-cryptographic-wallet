import { KmsSigner } from "./kms-signer";
import AWS from "aws-sdk";

jest.overloadSpyOn = jest.spyOn;

describe("KmsSigner", () => {
  let signer: KmsSigner;
  beforeEach(() => {
    signer = new KmsSigner("region", "keyId");

    jest.spyOn(signer["kms"], "sign").mockImplementation();
  });
  describe("getPublicKey", () => {
    type GetPublicKey = (
      params: AWS.KMS.Types.GetPublicKeyRequest,
      callback?: (
        err: AWS.AWSError,
        data: AWS.KMS.Types.GetPublicKeyResponse
      ) => void
    ) => AWS.Request<AWS.KMS.Types.GetPublicKeyResponse, AWS.AWSError>;

    describe("correct", () => {
      beforeEach(async () => {
        const getPublicKey: GetPublicKey = (
          param: AWS.KMS.GetPublicKeyRequest,
          callback?: (
            err: AWS.AWSError,
            data: AWS.KMS.GetPublicKeyResponse
          ) => void
        ) => {
          const err: AWS.AWSError = null as any;
          const data: AWS.KMS.GetPublicKeyResponse = {
            PublicKey: Buffer.from(
              "3056301006072a8648ce3d020106052b8104000a034200044badcc1608925c1d944e50ac6c9dbf0c5fb6b04b8548394a14cc7b5ab6667fde96dda298cf815e1f75d72f52704c3fdf333c84263b744d0e974f24d293bd303b",
              "hex"
            )
          };
          if (callback) {
            callback(err, data);
          }
          return ({} as any) as AWS.Request<
            AWS.KMS.GetPublicKeyResponse,
            AWS.AWSError
          >;
        };
        jest
          .overloadSpyOn(signer["kms"], "getPublicKey")
          .mockImplementation(getPublicKey);
      });

      it("can be return address", async () => {
        const address = await signer.getAddress();

        const expected = Buffer.from(
          "5de3b70a775a81943a65d9fd2aaa58bd1c141233",
          "hex"
        );
        expect(address).toEqual(expected);
      });
    });

    describe("when return non buffer type", () => {
      beforeEach(() => {
        const getPublicKey: GetPublicKey = (
          param: AWS.KMS.GetPublicKeyRequest,
          callback?: (
            err: AWS.AWSError,
            data: AWS.KMS.GetPublicKeyResponse
          ) => void
        ) => {
          const err: AWS.AWSError = null as any;
          const data: AWS.KMS.GetPublicKeyResponse = {
            PublicKey: {}
          };
          if (callback) {
            callback(err, data);
          }
          return ({} as any) as AWS.Request<
            AWS.KMS.GetPublicKeyResponse,
            AWS.AWSError
          >;
        };
        jest
          .overloadSpyOn(signer["kms"], "getPublicKey")
          .mockImplementation(getPublicKey);
      });
      it("can be throw error", async () => {
        await expect(signer.getAddress()).rejects.toThrow(
          /PublicKey is not Buffer/
        );
      });
    });
  });

  describe("sign", () => {
    type Sign = (
      params: AWS.KMS.Types.SignRequest,
      callback?: (err: AWS.AWSError, data: AWS.KMS.Types.SignResponse) => void
    ) => AWS.Request<AWS.KMS.Types.SignResponse, AWS.AWSError>;
    describe("correct", () => {
      beforeEach(() => {
        const sign: Sign = (
          param: AWS.KMS.Types.SignRequest,
          callback?: (
            err: AWS.AWSError,
            data: AWS.KMS.Types.SignResponse
          ) => void
        ) => {
          const err: AWS.AWSError = null as any;
          const data: AWS.KMS.Types.SignResponse = {
            Signature: Buffer.from(
              "304502201fa98c7c5f1b964a6b438d9283adf30519aaea2d1a2b25ac473ac0f85d6e08c0022100e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b",
              "hex"
            )
          };
          if (callback) {
            callback(err, data);
          }
          return ({} as any) as AWS.Request<
            AWS.KMS.Types.SignResponse,
            AWS.AWSError
          >;
        };

        jest.overloadSpyOn(signer["kms"], "sign").mockImplementation(sign);
        signer["solveV"] = jest.fn().mockReturnValue(0);
      });
      it("can be return signature", async () => {
        const digest = Buffer.from("");

        const signature = await signer.sign(digest);

        expect(signature.r.toString("hex")).toBe(
          "1fa98c7c5f1b964a6b438d9283adf30519aaea2d1a2b25ac473ac0f85d6e08c0"
        );

        expect(signature.s.toString("hex")).toBe(
          "e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b"
        );
      });
    });
    describe("when return non buffer type", () => {
      beforeEach(() => {
        const sign: Sign = (
          param: AWS.KMS.Types.SignRequest,
          callback?: (
            err: AWS.AWSError,
            data: AWS.KMS.Types.SignResponse
          ) => void
        ) => {
          const err: AWS.AWSError = null as any;
          const data: AWS.KMS.Types.SignResponse = {
            Signature: {} as any
          };
          if (callback) {
            callback(err, data);
          }
          return ({} as any) as AWS.Request<
            AWS.KMS.Types.SignResponse,
            AWS.AWSError
          >;
        };

        jest.overloadSpyOn(signer["kms"], "sign").mockImplementation(sign);
        signer["solveV"] = jest.fn().mockReturnValue(0);
      });
      it("can be throw error", async () => {
        const digest = Buffer.from("");
        await expect(signer.sign(digest)).rejects.toThrow(
          /Signature is not BUffer/
        );
      });
    });
  });
});
