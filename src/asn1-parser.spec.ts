import { parsePublicKey } from "./asn1-parser";

/*
:memo:
$ openssl ecparam -genkey -name secp256k1 -out key-pair.pem
$ openssl ec -in key-pair.pem -outform PEM -pubout -out public.pem
$ openssl asn1parse -in public.pem -out public.der
$ hexdump -ve '/1 "%02x"' public.der | pbcopy
*/

describe("parsePublicKey", () => {
  it("ok", () => {
    const buf = Buffer.from(
      "3056301006072a8648ce3d020106052b8104000a034200044badcc1608925c1d944e50ac6c9dbf0c5fb6b04b8548394a14cc7b5ab6667fde96dda298cf815e1f75d72f52704c3fdf333c84263b744d0e974f24d293bd303b",
      "hex"
    );
    const publicKey = parsePublicKey(buf);
    console.log(publicKey);

    expect(publicKey.toString("hex")).toBe(
      "4badcc1608925c1d944e50ac6c9dbf0c5fb6b04b8548394a14cc7b5ab6667fde96dda298cf815e1f75d72f52704c3fdf333c84263b744d0e974f24d293bd303b"
    );
  });
});
