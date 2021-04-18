import { Ethereum } from "./ethereum";

jest.mock("node-fetch", () => {
  return require("fetch-mock-jest").sandbox();
});

describe("Ethereum", () => {
  describe.skip("create instance", () => {
    describe("when unknown protocol", () => {
      it("should be throw error", () => {
        expect(() => new Ethereum("ws://localhost")).toThrow();
      });
    });
  });

  describe.each(["http", "https"])("protocol %s", (protocol) => {
    describe("netVersion", () => {
      it("should be return network id", async () => {
        const endpoint = `${protocol}://example.com/path/to/`;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fetchMock = require("node-fetch");
        fetchMock.mock(
          { url: endpoint, method: "POST" },
          { jsonrpc: "2.0", result: 3, id: 0 }
        );
        // */

        const ethereum = new Ethereum(endpoint);

        await expect(ethereum.netVersion()).resolves.toBe("3");
      });
    });
  });
});
