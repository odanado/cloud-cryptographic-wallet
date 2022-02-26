import { Ethereum } from "./ethereum";

// XXX: https://www.white-space.work/node-js-headers-is-not-defined/
import { Headers } from "node-fetch";
// @ts-expect-error 何故か型がない
global.Headers = Headers;

jest.mock("isomorphic-fetch", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("fetch-mock-jest").sandbox();
});

describe("Ethereum", () => {
  describe.each(["http", "https"])("protocol %s", (protocol) => {
    describe("netVersion", () => {
      it("should be return network id", async () => {
        const endpoint = `${protocol}://example.com/path/to/`;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fetchMock = require("isomorphic-fetch");
        fetchMock.mock(endpoint, { jsonrpc: "2.0", result: "3", id: 0 });

        const ethereum = new Ethereum(endpoint);

        await expect(ethereum.netVersion()).resolves.toBe("3");
      });
    });
  });
});
