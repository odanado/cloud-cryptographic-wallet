import { describe, it, expect } from "vitest";

import { Bytes } from "@cloud-cryptographic-wallet/signer";

import { parseSignature } from "./parse-signature.js";

describe("parseSignature", () => {
  describe("when 142-length signature", () => {
    it("should be parse", () => {
      const bytes = Bytes.fromString(
        "304502201fa98c7c5f1b964a6b438d9283adf30519aaea2d1a2b25ac473ac0f85d6e08c0022100e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b"
      );

      const signature = parseSignature(bytes.buffer);

      const r = Bytes.fromArrayBuffer(signature.r);
      const s = Bytes.fromArrayBuffer(signature.s);

      expect(
        r.equals(
          Bytes.fromString(
            "1fa98c7c5f1b964a6b438d9283adf30519aaea2d1a2b25ac473ac0f85d6e08c0"
          )
        )
      ).toBeTruthy();
      expect(
        s.equals(
          Bytes.fromString(
            "e26f7c547cf497959af070ec7c43ebdbb3e4341395912d6ccc950b43e886781b"
          )
        )
      ).toBeTruthy();

      expect(r.length).toBe(32);
      expect(s.length).toBe(32);
    });
  });
  describe("when 140-length signature", () => {
    it("should be parse", () => {
      const bytes = Bytes.fromString(
        "30440221009c68bf9b88814142fef77d95956b21625789c34fde9b853653b24fc23515577f021f74e3e4d71e7385ae71042b0f99f7fbbf66e7760dd513ed2fcea754e2a9131c"
      );

      const signature = parseSignature(bytes.buffer);

      const r = Bytes.fromArrayBuffer(signature.r);
      const s = Bytes.fromArrayBuffer(signature.s);

      expect(
        r.equals(
          Bytes.fromString(
            "9c68bf9b88814142fef77d95956b21625789c34fde9b853653b24fc23515577f"
          )
        )
      ).toBeTruthy();
      expect(
        s.equals(
          Bytes.fromString(
            "0074e3e4d71e7385ae71042b0f99f7fbbf66e7760dd513ed2fcea754e2a9131c"
          )
        )
      ).toBeTruthy();

      expect(r.length).toBe(32);
      expect(s.length).toBe(32);
    });
  });

  describe("when invalid input", () => {
    it("should be throw Error", () => {
      const bytes = Bytes.fromString("abcd");

      expect(() => parseSignature(bytes.buffer)).toThrow(
        /parseSignature: failed to parse/
      );
    });
  });
});
