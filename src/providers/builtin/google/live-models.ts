export const GOOGLE_MODERN_MODEL_PREFIXES = ["gemini-3"];

function matchesPrefix(id: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => id.startsWith(prefix));
}

export function isGoogleModernModelId(id: string): boolean {
  return matchesPrefix(id, GOOGLE_MODERN_MODEL_PREFIXES);
}
