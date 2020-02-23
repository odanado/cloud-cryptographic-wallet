import { parsePublicKey, parseSignature } from "./asn1-parser";

/*
:memo:
$ openssl ecparam -genkey -name secp256k1 -out key-pair.pem
$ openssl ec -in key-pair.pem -outform PEM -pubout -out public.pem
$ openssl asn1parse -in public.pem -out public.der
$ hexdump -ve '/1 "%02x"' public.der | pbcopy

$ echo abcde > plain.txt
$ openssl dgst -sha1 -sign private.pem plain.txt > signature.dat
$ openssl asn1parse -inform DER -in signature.dat
*/

describe("parsePublicKey", () => {
  it("ok", () => {
    const buf = Buffer.from(
      "3056301006072a8648ce3d020106052b8104000a034200044badcc1608925c1d944e50ac6c9dbf0c5fb6b04b8548394a14cc7b5ab6667fde96dda298cf815e1f75d72f52704c3fdf333c84263b744d0e974f24d293bd303b",
      "hex"
    );
    const publicKey = parsePublicKey(buf);

    expect(publicKey.toString("hex")).toBe(
      "4badcc1608925c1d944e50ac6c9dbf0c5fb6b04b8548394a14cc7b5ab6667fde96dda298cf815e1f75d72f52704c3fdf333c84263b744d0e974f24d293bd303b"
    );
  });
});

describe("parseSignature", () => {
  it("ok", () => {
    const buf = Buffer.from(
      "304502201fa98c7c5f1b964a6b438d9283adf30519aaea2d1a2b25ac473ac0f85d6e08c0022100e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b",
      "hex"
    );
    const signature = parseSignature(buf);

    expect(signature.r.length).toBe(32);
    expect(signature.s.length).toBe(32);

    expect(signature.r.toString("hex")).toBe(
      "1fa98c7c5f1b964a6b438d9283adf30519aaea2d1a2b25ac473ac0f85d6e08c0"
    );

    expect(signature.s.toString("hex")).toBe(
      "e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b"
    );
  });
});
