import type { ModelProviderConfig } from "../../../config/types.models.js";
import type {
  BuiltinImplicitProviderResolverContext,
  BuiltinImplicitProviderResolverResult,
} from "../implicit-types.js";

export const XIAOMI_BASE_URL = "https://api.xiaomimimo.com/anthropic";
export const XIAOMI_DEFAULT_MODEL_ID = "mimo-v2-flash";
export const XIAOMI_DEFAULT_CONTEXT_WINDOW = 262144;
export const XIAOMI_DEFAULT_MAX_TOKENS = 8192;
export const XIAOMI_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export function buildXiaomiProviderConfig(): ModelProviderConfig {
  return {
    baseUrl: XIAOMI_BASE_URL,
    api: "anthropic-messages",
    models: [
      {
        id: XIAOMI_DEFAULT_MODEL_ID,
        name: "Xiaomi MiMo V2 Flash",
        reasoning: false,
        input: ["text"],
        cost: XIAOMI_DEFAULT_COST,
        contextWindow: XIAOMI_DEFAULT_CONTEXT_WINDOW,
        maxTokens: XIAOMI_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export function resolveXiaomiImplicitProviders(
  params: BuiltinImplicitProviderResolverContext,
): BuiltinImplicitProviderResolverResult {
  const xiaomiKey =
    params.resolveEnvApiKeyVarName("xiaomi") ?? params.resolveApiKeyFromProfiles("xiaomi");
  if (!xiaomiKey) {
    return {};
  }
  return { xiaomi: { ...buildXiaomiProviderConfig(), apiKey: xiaomiKey } };
}
