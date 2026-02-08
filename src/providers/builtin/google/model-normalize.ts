const GOOGLE_MODEL_ALIASES: Record<string, string> = {
  "gemini-3-pro": "gemini-3-pro-preview",
  "gemini-3-flash": "gemini-3-flash-preview",
};

export function normalizeGoogleProviderModelId(model: string): string {
  const trimmed = model.trim();
  if (!trimmed) {
    return trimmed;
  }
  const lower = trimmed.toLowerCase();
  return GOOGLE_MODEL_ALIASES[lower] ?? trimmed;
}
