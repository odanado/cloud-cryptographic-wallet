declare module "web3-provider-engine/subproviders/hooked-wallet" {
  import { TxData as BaseTxData } from "ethereumjs-tx/dist/types";

  export interface TxData extends BaseTxData {
    from: string;
    to: string;
  }

  export interface MsgParams {
    from: string;
    data: string;
  }

  type Callback<T> = (err: Error | null, value?: T) => void;

  interface HookedSubproviderOptions {
    getAccounts?: (cb: Callback<string[]>) => void;

    processTransaction?: Function;
    processMessage?: Function;
    processPersonalMessage?: Function;
    processTypedMessage?: Function;

    approveTransaction?: Function;
    approveMessage?: Function;
    approvePersonalMessage?: Function;
    approveDecryptMessage?: Function;
    approveEncryptionPublicKey?: Function;
    approveTypedMessage?: Function;

    signTransaction?: (txData: TxData, cb: Callback<string>) => void;
    signMessage?: (msgParams: MsgParams, cb: Callback<string>) => void;
    signPersonalMessage?: Function;
    decryptMessage?: Function;
    encryptionPublicKey?: Function;
    signTypedMessage?: Function;
    recoverPersonalSignature?: Function;

    publishTransaction?: Function;

    estimateGas?: Function;
    getGasPrice?: Function;
  }

  // TODO: inherits(HookedWalletSubprovider, Subprovider)
  class HookedSubprovider {
    public constructor(opt: HookedSubproviderOptions);
  }
  export default HookedSubprovider;
}
