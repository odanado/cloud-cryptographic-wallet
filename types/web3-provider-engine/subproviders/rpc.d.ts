declare module "web3-provider-engine/subproviders/rpc" {
  class RpcSubprovider {
    public constructor(opts: { rpcUrl: string });
  }

  export = RpcSubprovider;
}
