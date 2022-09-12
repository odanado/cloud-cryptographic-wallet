import { Signature } from "@cloud-cryptographic-wallet/signer";
import tx from "@ethereumjs/tx";

export function processSignature(
  typedTransaction: tx.TypedTransaction,
  signature: Signature
): tx.TypedTransaction {
  const r = Buffer.from(signature.r.buffer);
  const s = Buffer.from(signature.s.buffer);
  const v = BigInt(signature.v);
  if (typedTransaction instanceof tx.Transaction) {
    return typedTransaction["_processSignature"](v, r, s);
  } else {
    return typedTransaction._processSignature(v, r, s);
  }
}
