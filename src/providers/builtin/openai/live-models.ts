export const OPENAI_MODERN_MODEL_PREFIXES = ["gpt-5.2", "gpt-5.0"];

export const OPENAI_CODEX_MODERN_MODEL_PREFIXES = [
  "gpt-5.2",
  "gpt-5.2-codex",
  "gpt-5.3-codex",
  "gpt-5.1-codex",
  "gpt-5.1-codex-mini",
  "gpt-5.1-codex-max",
];

function matchesExactOrPrefix(id: string, values: string[]): boolean {
  return values.some((value) => id === value || id.startsWith(value));
}

export function isOpenAiModernModelId(id: string): boolean {
  return matchesExactOrPrefix(id, OPENAI_MODERN_MODEL_PREFIXES);
}

export function isOpenAiCodexModernModelId(id: string): boolean {
  return matchesExactOrPrefix(id, OPENAI_CODEX_MODERN_MODEL_PREFIXES);
}
