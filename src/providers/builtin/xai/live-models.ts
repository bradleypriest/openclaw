export const XAI_MODERN_MODEL_PREFIXES = ["grok-4"];

function matchesPrefix(id: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => id.startsWith(prefix));
}

export function isXaiModernModelId(id: string): boolean {
  return matchesPrefix(id, XAI_MODERN_MODEL_PREFIXES);
}
