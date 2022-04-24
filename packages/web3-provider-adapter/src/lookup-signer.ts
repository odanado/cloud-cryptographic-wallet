import { Address, Bytes, Signer } from "@cloud-cryptographic-wallet/signer";

export async function lookupSigner(
  _address: string,
  signers: Signer[]
): Promise<Signer | undefined> {
  const address = Address.fromBytes(Bytes.fromString(_address));
  for (const signer of signers) {
    if ((await signer.getPublicKey()).toAddress().equals(address)) {
      return signer;
    }
  }
}
