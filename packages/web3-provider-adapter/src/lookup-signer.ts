import { Address, Bytes, Signer } from "@cloud-cryptographic-wallet/signer";

export async function lookupSigner(
  _address: string,
  singers: Signer[]
): Promise<Signer | undefined> {
  const address = Address.fromBytes(Bytes.fromString(_address));
  for (const singer of singers) {
    if ((await singer.getPublicKey()).toAddress().equals(address)) {
      return singer;
    }
  }
}
