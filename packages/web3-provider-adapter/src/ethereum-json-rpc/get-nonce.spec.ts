import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";

import {
  getServer,
  makeHandler,
} from "../../../../test/test-utils/json-rpc-server.mock.js";
import { getNonce } from "./get-nonce.js";

describe("getNonce", () => {
  const rpcUrl = "http://locahost:8545";
  const from = "0x9f60980a13f74d79214E258D2F52Fd846A3a5511";

  const server = getServer(rpcUrl, []);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("when return nonce", () => {
    const nonce = "0x10";
    beforeEach(() => {
      server.use(
        makeHandler(rpcUrl, {
          method: "eth_getTransactionCount",
          result: nonce,
        })
      );
    });

    it("shoud be get nonce", async () => {
      await expect(getNonce(rpcUrl, from)).resolves.toBe(nonce);
    });
  });

  describe("when return null", () => {
    beforeEach(() => {
      server.use(
        makeHandler(rpcUrl, {
          method: "eth_getTransactionCount",
          result: null,
        })
      );
    });

    it("shoud be throw error", async () => {
      await expect(getNonce(rpcUrl, from)).rejects.toThrow(
        /can't get result of eth_getTransactionCount/
      );
    });
  });
});
