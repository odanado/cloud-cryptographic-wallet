export function assertKnownAddress(from: string, addresses: string[]): void {
  if (
    addresses.every((address) => address.toLowerCase() !== from.toLowerCase())
  ) {
    throw new Error(
      `assertKnownAddress: from is unknown address. actual: ${from}`
    );
  }
}
