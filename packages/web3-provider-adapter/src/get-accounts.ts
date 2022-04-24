import { PublicKey, Signer } from "@cloud-cryptographic-wallet/signer";

export async function getAccounts(signers: Signer[]): Promise<string[]> {
  const publicKeys: PublicKey[] = [];

  for (const signer of signers) {
    publicKeys.push(await signer.getPublicKey());
  }

  return publicKeys.map((publicKey) => publicKey.toAddress().toString());
}
