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
} from "../../../../test/test-utils/json-rpc-server.mock.js";
import { getGas } from "./get-gas.js";

describe("getGas", () => {
  const rpcUrl = "http://locahost:8545";

  const server = getServer(rpcUrl, []);
  const txParams = { from: "0x9f60980a13f74d79214E258D2F52Fd846A3a5511" };

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("when return gas", () => {
    const gas = "0x5208";

    beforeEach(() => {
      server.use(
        makeHandler(rpcUrl, {
          method: "eth_estimateGas",
          result: gas,
        })
      );
    });

    it("shoud be get gas", async () => {
      await expect(getGas(rpcUrl, txParams)).resolves.toBe(gas);
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
      await expect(getGas(rpcUrl, txParams)).rejects.toThrow(
        /can't get result of eth_estimateGas/
      );
    });
  });
});
