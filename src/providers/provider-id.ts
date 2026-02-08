const PROVIDER_ID_ALIASES: Record<string, string> = {
  "z.ai": "zai",
  "z-ai": "zai",
  "opencode-zen": "opencode",
  qwen: "qwen-portal",
  "kimi-code": "kimi-coding",
};

export function normalizeProviderId(provider: string): string {
  const normalized = provider.trim().toLowerCase();
  return PROVIDER_ID_ALIASES[normalized] ?? normalized;
}
