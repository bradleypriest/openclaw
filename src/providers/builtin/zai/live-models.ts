export const ZAI_MODERN_MODEL_PREFIXES = ["glm-4.7"];

function matchesPrefix(id: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => id.startsWith(prefix));
}

export function isZaiModernModelId(id: string): boolean {
  return matchesPrefix(id, ZAI_MODERN_MODEL_PREFIXES);
}
