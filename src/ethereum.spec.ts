import nock from "nock";
import { Ethereum } from "./ethereum";

describe("Ethereum", () => {
  describe("create instance", () => {
    describe("when unknown protocol", () => {
      it("should be throw error", () => {
        expect(() => new Ethereum("ws://localhost")).toThrow();
      });
    });
  });

  describe("netVersion", () => {
    it("should be return network id", async () => {
      const endpoint = "http://example.com/path/to/";
      const scope = nock(endpoint)
        .post("/", {
          method: "net_version",
          jsonrpc: "2.0",
          params: [],
          id: /.*/,
        })
        .reply(200, { result: "3", jsonrpc: "2.0" });

      const ethereum = new Ethereum(endpoint);

      await expect(ethereum.netVersion()).resolves.toBe("3");
      expect(scope.isDone()).toBeTruthy();
    });
  });
});
