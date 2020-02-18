import AWS from "aws-sdk";
import Web3 from "web3";
import * as asn1js from "asn1js";
import { hash, recover } from "./crypto";

export function add(x: number, y: number): number {
  return x + y;
}

function toArrayBuffer(buffer: Buffer) {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function loadFromAsn1(buf: Buffer) {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;
  const getHex = (value: asn1js.Integer) => {
    console.log(value.valueBlock.valueHex.byteLength);
    const hex = Buffer.from(value.valueBlock.valueHex).toString("hex");
    if (hex.startsWith("00")) {
      return hex.slice(2);
    }
    return hex;
  };
  const r = getHex(values[0] as asn1js.Integer);
  const s = getHex(values[1] as asn1js.Integer);
  return { r, s };
}

async function main(): Promise<void> {
  console.log("poyo");
  const kms = new AWS.KMS({ region: "us-east-1" });
  const message = "aaa";
  const keyId = "e9005048-475f-4767-9f2d-0d1fb0c89caf";
  const pubkey = await new Promise<AWS.KMS.GetPublicKeyResponse>(
    (resolve, reject) => {
      kms.getPublicKey({ KeyId: keyId }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    }
  );
  const address = hash(pubkey.PublicKey as Buffer).slice(12, 32);
  console.log(address.toString("hex"));
  const messageHash = hash(Buffer.from(message, "utf-8"));
  console.log("messageHash", messageHash);
  kms.sign(
    {
      KeyId: keyId,
      Message: messageHash,
      MessageType: "DIGEST",
      SigningAlgorithm: "ECDSA_SHA_256"
    },
    (err, data) => {
      console.log("err", err);
      const sig = data.Signature as Buffer;

      const { r, s } = loadFromAsn1(sig);

      console.log(
        recover(messageHash, Buffer.from(r, "hex"), Buffer.from(s, "hex"))
      );
    }
  );
}
main();
