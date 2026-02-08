export const ANTHROPIC_MODERN_MODEL_PREFIXES = [
  "claude-opus-4-6",
  "claude-opus-4-5",
  "claude-sonnet-4-5",
  "claude-haiku-4-5",
];

function matchesPrefix(id: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => id.startsWith(prefix));
}

export function isAnthropicModernModelId(id: string): boolean {
  return matchesPrefix(id, ANTHROPIC_MODERN_MODEL_PREFIXES);
}
