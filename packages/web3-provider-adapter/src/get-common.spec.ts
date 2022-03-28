import {
  it,
  describe,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import {
  getServer,
  makeHandler,
} from "../../../test/test-utils/json-rpc-server.mock.js";
import { getCommon } from "./get-common.js";

describe("getCommon", () => {
  const rpcUrl = "http://locahost:8545";

  const server = getServer(rpcUrl, []);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("when return gas", () => {
    const chainId = "0x1";

    beforeEach(() => {
      server.use(
        makeHandler(rpcUrl, {
          method: "eth_chainId",
          result: chainId,
        })
      );
    });

    it("shoud be get common", async () => {
      const common = await getCommon(rpcUrl);

      expect(`0x${common.chainIdBN().toString("hex")}`).toBe(chainId);
    });
  });
  describe("when return null", () => {
    beforeEach(() => {
      server.use(
        makeHandler(rpcUrl, {
          method: "eth_estimateGas",
          result: null,
        })
      );
    });

    it("shoud be throw error", async () => {
      await expect(getCommon(rpcUrl)).rejects.toThrow(
        /can't get result of eth_chainId/
      );
    });
  });
});
