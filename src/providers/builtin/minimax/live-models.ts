export const MINIMAX_MODERN_MODEL_PREFIXES = ["minimax-m2.1"];

function matchesPrefix(id: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => id.startsWith(prefix));
}

export function isMiniMaxModernModelId(id: string): boolean {
  return matchesPrefix(id, MINIMAX_MODERN_MODEL_PREFIXES);
}
