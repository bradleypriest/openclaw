import type { ModelDefinitionConfig, ModelProviderConfig } from "../../../config/types.js";
import type {
  BuiltinImplicitProviderResolverContext,
  BuiltinImplicitProviderResolverResult,
} from "../implicit-types.js";

export const MOONSHOT_BASE_URL = "https://api.moonshot.ai/v1";
export const MOONSHOT_CN_BASE_URL = "https://api.moonshot.cn/v1";
export const MOONSHOT_DEFAULT_MODEL_ID = "kimi-k2.5";
export const MOONSHOT_DEFAULT_MODEL_REF = `moonshot/${MOONSHOT_DEFAULT_MODEL_ID}`;
export const MOONSHOT_DEFAULT_CONTEXT_WINDOW = 256000;
export const MOONSHOT_DEFAULT_MAX_TOKENS = 8192;
export const MOONSHOT_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export function buildMoonshotModelDefinition(): ModelDefinitionConfig {
  return {
    id: MOONSHOT_DEFAULT_MODEL_ID,
    name: "Kimi K2.5",
    reasoning: false,
    input: ["text"],
    cost: MOONSHOT_DEFAULT_COST,
    contextWindow: MOONSHOT_DEFAULT_CONTEXT_WINDOW,
    maxTokens: MOONSHOT_DEFAULT_MAX_TOKENS,
  };
}

export function buildMoonshotProviderConfig(): ModelProviderConfig {
  return {
    baseUrl: MOONSHOT_BASE_URL,
    api: "openai-completions",
    models: [buildMoonshotModelDefinition()],
  };
}

export function resolveMoonshotImplicitProviders(
  params: BuiltinImplicitProviderResolverContext,
): BuiltinImplicitProviderResolverResult {
  const moonshotKey =
    params.resolveEnvApiKeyVarName("moonshot") ?? params.resolveApiKeyFromProfiles("moonshot");
  if (!moonshotKey) {
    return {};
  }
  return { moonshot: { ...buildMoonshotProviderConfig(), apiKey: moonshotKey } };
}
