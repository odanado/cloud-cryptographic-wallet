import { describe, it, expect } from "vitest";

import { randomBytes } from "crypto";
import secp256k1 from "secp256k1";
import {
  Bytes,
  PublicKey,
  Signature,
  Signer,
} from "@cloud-cryptographic-wallet/signer";
import { createFromValidateMiddleware } from "./from-validate-middleware.js";
import { JsonRpcEngine, JsonRpcRequest } from "json-rpc-engine";

class SignerForTest implements Signer {
  private privateKey;
  constructor() {
    let privateKey: Buffer;
    do {
      privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));

    this.privateKey = privateKey;
  }
  getPublicKey(): Promise<PublicKey> {
    return Promise.resolve(
      PublicKey.fromBytes(
        Bytes.fromArrayBuffer(
          secp256k1.publicKeyCreate(this.privateKey, false).slice(1)
        )
      )
    );
  }
  sign(hash: Bytes): Promise<Signature> {
    const { signature, recid } = secp256k1.ecdsaSign(
      hash.asUint8Array,
      this.privateKey
    );

    console.log(signature, signature.length);
    return Promise.resolve(
      Signature.fromRSV(
        Bytes.fromArrayBuffer(signature.slice(0, 64)),
        Bytes.fromArrayBuffer(signature.slice(64)),
        recid
      )
    );
  }
}

describe("createFromValidateMiddleware", () => {
  const signer = new SignerForTest();

  const fromValidateMiddleware = createFromValidateMiddleware({
    signers: [signer],
  });
  const engine = new JsonRpcEngine();

  describe("when from is missing", () => {
    it("shoud be get error", (done) => {
      expect.assertions(1);

      engine.push(fromValidateMiddleware);

      const req: JsonRpcRequest<unknown> = {
        jsonrpc: "2.0",
        id: 42,
        method: "eth_sendTransaction",
        params: {},
      };
      engine.handle(req, async (error) => {
        if (error instanceof Error) {
          expect(error.message).toMatch(/from is missing/);
        }

        done();
      });
    });
  });

  describe("when from is incorrect", () => {
    it("shoud be get error", (done) => {
      expect.assertions(1);

      engine.push(fromValidateMiddleware);

      const from = "0xcb18adc534b1f96107c71e95994b17f105d058be";

      const req: JsonRpcRequest<unknown> = {
        jsonrpc: "2.0",
        id: 42,
        method: "eth_sendTransaction",
        params: { from },
      };
      engine.handle(req, async (error) => {
        expect(() => {
          throw error;
        }).toThrow(/from is unknown address/);

        done();
      });
    });
  });
  describe("when from is a address of signer", () => {
    it("should be get error of JsonRpcEngine", async (done) => {
      engine.push(fromValidateMiddleware);
      const from = (await signer.getPublicKey()).toAddress().toString();

      const req: JsonRpcRequest<unknown> = {
        jsonrpc: "2.0",
        id: 42,
        method: "eth_sendTransaction",
        params: { from },
      };
      engine.handle(req, (error) => {
        expect(() => {
          throw error;
        }).toThrow(/Response has no error or result for request/);

        done();
      });
    });
  });
});
