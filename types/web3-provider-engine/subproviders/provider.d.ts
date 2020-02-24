declare module "web3-provider-engine/subproviders/provider" {
  import { Provider } from "ethereum-protocol";

  class ProviderSubprovider {
    public constructor(provider: Provider);
  }

  export = ProviderSubprovider;
}
