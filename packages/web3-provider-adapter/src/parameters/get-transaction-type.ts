// ref: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#generic-type-parameters-are-implicitly-constrained-to-unknown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MaybeTransaction = Record<string, any>;

export function getTransactionType(transaction: MaybeTransaction): number {
  if (transaction.type !== undefined) {
    if (typeof transaction.type !== "number") {
      throw new Error(
        `getTransactionType: transaction.type must be number. actual: ${transaction.type}`
      );
    }
    return transaction.type;
  }

  if (transaction.maxFeePerGas !== undefined) {
    // EIP-1559
    return 2;
  }

  if (transaction.accessList !== undefined) {
    // EIP-2930
    return 1;
  }

  // Legacy Transaction
  return 0;
}
