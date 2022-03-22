export function hasNonce(params: unknown): params is { nonce: string } {
  return params !== null && typeof params === "object" && "nonce" in params;
}
