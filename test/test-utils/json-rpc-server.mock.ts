import { setupServer, SetupServerApi } from "msw/node";
import { rest, RestHandler, MockedRequest, DefaultRequestBody } from "msw";

export function makeHandler(
  rpcUrl: string,
  mock: Mock
): RestHandler<MockedRequest<DefaultRequestBody>> {
  const handler = rest.post<{ id: string; method: string }>(
    rpcUrl,
    (req, res, ctx) => {
      const { id, method } = req.body;
      if (method === mock.method) {
        return res(
          ctx.json({
            id,
            result: mock.result,
          })
        );
      }

      return res(ctx.json({}));
    }
  );

  return handler;
}

export type Mock<T = unknown> = {
  method: string;
  result: T;
};

export function getServer(rpcUrl: string, mocks: Mock[]): SetupServerApi {
  const handlers = mocks.map((mock) => makeHandler(rpcUrl, mock));
  return setupServer(...handlers);
}
