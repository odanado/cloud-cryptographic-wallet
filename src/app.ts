import AWS from "aws-sdk";
import Web3 from "web3";
import * as asn1js from "asn1js";
import { hash, recover, sha256 } from "./crypto";

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

function loadPubkeyFromAsn1(buf: Buffer) {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;

  const value = values[1] as asn1js.BitString;
  return Buffer.from(value.valueBlock.valueHex.slice(1));
}

function loadFromAsn1(buf: Buffer) {
  const { result } = asn1js.fromBER(toArrayBuffer(buf));
  const values = (result as asn1js.Sequence).valueBlock.value;
  const getHex = (value: asn1js.Integer) => {
    //console.log(value.valueBlock.valueHex.byteLength);
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
  const pubkeyRes = await new Promise<AWS.KMS.GetPublicKeyResponse>(
    (resolve, reject) => {
      kms.getPublicKey({ KeyId: keyId }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    }
  );
  console.log((pubkeyRes.PublicKey as Buffer).toString("hex"));
  const pubkey = loadPubkeyFromAsn1(pubkeyRes.PublicKey as Buffer);
  console.log(pubkey.toString("hex"));
  const address = hash(pubkey).slice(12, 32);
  console.log("address", address.toString("hex"));
  const messageHash = sha256(Buffer.from(message, "utf-8"));
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
      if (!data.Signature) return;
      const sig = data.Signature as Buffer;

      console.log(sig.toString("hex"));
      const { r, s } = loadFromAsn1(sig);
      console.log(r, s);

      [...new Array(2).keys()].forEach(i => {
        console.log(
          i,
          recover(messageHash, Buffer.from(r, "hex"), Buffer.from(s, "hex"), i)
        );
      });
    }
  );
}
main();
