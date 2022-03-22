export function hasFrom(params: unknown): params is { from: string } {
  return params !== null && typeof params === "object" && "from" in params;
}
