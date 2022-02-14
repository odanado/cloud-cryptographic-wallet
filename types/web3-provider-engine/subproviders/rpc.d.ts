declare module "web3-provider-engine/subproviders/rpc.js" {
  class RpcSubprovider {
    public constructor(opts: { rpcUrl: string });
  }

  export = RpcSubprovider;
}
