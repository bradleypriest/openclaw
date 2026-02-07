import type { OpenClawConfig } from "../config/config.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { findDeclarativeProviderAuthByProvider } from "../plugins/provider-auth-manifest.js";

const BUILTIN_PROVIDER_ENV_VAR_CANDIDATES: Record<string, string[]> = {
  "github-copilot": ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"],
  anthropic: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
  chutes: ["CHUTES_OAUTH_TOKEN", "CHUTES_API_KEY"],
  zai: ["ZAI_API_KEY", "Z_AI_API_KEY"],
  "qwen-portal": ["QWEN_OAUTH_TOKEN", "QWEN_PORTAL_API_KEY"],
  "minimax-portal": ["MINIMAX_OAUTH_TOKEN", "MINIMAX_API_KEY"],
  "kimi-coding": ["KIMI_API_KEY", "KIMICODE_API_KEY"],
  opencode: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  google: ["GEMINI_API_KEY"],
  voyage: ["VOYAGE_API_KEY"],
  groq: ["GROQ_API_KEY"],
  deepgram: ["DEEPGRAM_API_KEY"],
  cerebras: ["CEREBRAS_API_KEY"],
  xai: ["XAI_API_KEY"],
  openrouter: ["OPENROUTER_API_KEY"],
  "vercel-ai-gateway": ["AI_GATEWAY_API_KEY"],
  "cloudflare-ai-gateway": ["CLOUDFLARE_AI_GATEWAY_API_KEY"],
  moonshot: ["MOONSHOT_API_KEY"],
  minimax: ["MINIMAX_API_KEY"],
  xiaomi: ["XIAOMI_API_KEY"],
  synthetic: ["SYNTHETIC_API_KEY"],
  venice: ["VENICE_API_KEY"],
  mistral: ["MISTRAL_API_KEY"],
  qianfan: ["QIANFAN_API_KEY"],
  ollama: ["OLLAMA_API_KEY"],
};

export function resolveProviderEnvVarCandidates(
  provider: string,
  params: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    includeDeclarative?: boolean;
  } = {},
): string[] {
  const normalized = normalizeProviderId(provider);
  const base = BUILTIN_PROVIDER_ENV_VAR_CANDIDATES[normalized] ?? [];
  const candidates = [...base];

  if (params.includeDeclarative !== false) {
    const declarative = findDeclarativeProviderAuthByProvider(normalized, {
      config: params.config,
      workspaceDir: params.workspaceDir,
    });
    if (declarative?.envVars?.length) {
      candidates.push(...declarative.envVars);
    }
  }

  return [...new Set(candidates.map((value) => value.trim()).filter(Boolean))];
}
