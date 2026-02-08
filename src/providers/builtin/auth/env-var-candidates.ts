import { normalizeProviderId } from "../../provider-id.js";
import { BUILTIN_NON_INTERACTIVE_API_KEY_SPECS } from "../api-key/non-interactive-specs.js";

const EXTRA_PROVIDER_ENV_VAR_CANDIDATES: Record<string, string[]> = {
  "github-copilot": ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"],
  anthropic: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  chutes: ["CHUTES_OAUTH_TOKEN", "CHUTES_API_KEY"],
  zai: ["ZAI_API_KEY", "Z_AI_API_KEY"],
  "qwen-portal": ["QWEN_OAUTH_TOKEN", "QWEN_PORTAL_API_KEY"],
  "minimax-portal": ["MINIMAX_OAUTH_TOKEN", "MINIMAX_API_KEY"],
  "kimi-coding": ["KIMI_API_KEY", "KIMICODE_API_KEY"],
  opencode: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
  groq: ["GROQ_API_KEY"],
  deepgram: ["DEEPGRAM_API_KEY"],
  cerebras: ["CEREBRAS_API_KEY"],
  mistral: ["MISTRAL_API_KEY"],
  ollama: ["OLLAMA_API_KEY"],
};

const BUILTIN_PROVIDER_ENV_VAR_CANDIDATES: Record<string, string[]> = (() => {
  const map = new Map<string, Set<string>>();

  const add = (providerRaw: string, envVarRaw: string) => {
    const provider = normalizeProviderId(providerRaw);
    const candidates = envVarRaw.match(/[A-Z][A-Z0-9_]+/g) ?? [];
    if (candidates.length === 0) {
      return;
    }
    const current = map.get(provider) ?? new Set<string>();
    for (const candidate of candidates) {
      current.add(candidate);
    }
    map.set(provider, current);
  };

  for (const spec of BUILTIN_NON_INTERACTIVE_API_KEY_SPECS) {
    add(spec.providerId, spec.envVar);
  }

  for (const [provider, envVars] of Object.entries(EXTRA_PROVIDER_ENV_VAR_CANDIDATES)) {
    for (const envVar of envVars) {
      add(provider, envVar);
    }
  }

  return Object.fromEntries(
    [...map.entries()].map(([provider, envVars]) => [provider, [...envVars]]),
  );
})();

export function resolveBuiltinProviderEnvVarCandidates(provider: string): string[] {
  const normalized = normalizeProviderId(provider);
  return BUILTIN_PROVIDER_ENV_VAR_CANDIDATES[normalized] ?? [];
}

export function listBuiltinProviderEnvVarCandidateProviders(): string[] {
  return Object.keys(BUILTIN_PROVIDER_ENV_VAR_CANDIDATES);
}

export function listBuiltinProviderEnvVarCandidateKeys(): string[] {
  return [...new Set(Object.values(BUILTIN_PROVIDER_ENV_VAR_CANDIDATES).flat())];
}
