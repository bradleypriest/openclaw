import type {
  BuiltinImplicitProviderConfig,
  BuiltinImplicitProviderResolverContext,
  BuiltinImplicitProviderResolverResult,
} from "../implicit-types.js";

export const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
export const QIANFAN_DEFAULT_MODEL_ID = "deepseek-v3.2";
export const QIANFAN_DEFAULT_MODEL_REF = `qianfan/${QIANFAN_DEFAULT_MODEL_ID}`;
export const QIANFAN_DEFAULT_CONTEXT_WINDOW = 98304;
export const QIANFAN_DEFAULT_MAX_TOKENS = 32768;
export const QIANFAN_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export function buildQianfanProviderConfig(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: QIANFAN_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: QIANFAN_DEFAULT_MODEL_ID,
        name: "DEEPSEEK V3.2",
        reasoning: true,
        input: ["text"],
        cost: QIANFAN_DEFAULT_COST,
        contextWindow: QIANFAN_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QIANFAN_DEFAULT_MAX_TOKENS,
      },
      {
        id: "ernie-5.0-thinking-preview",
        name: "ERNIE-5.0-Thinking-Preview",
        reasoning: true,
        input: ["text", "image"],
        cost: QIANFAN_DEFAULT_COST,
        contextWindow: 119000,
        maxTokens: 64000,
      },
    ],
  };
}

export function resolveQianfanImplicitProviders(
  params: BuiltinImplicitProviderResolverContext,
): BuiltinImplicitProviderResolverResult {
  const qianfanKey =
    params.resolveEnvApiKeyVarName("qianfan") ?? params.resolveApiKeyFromProfiles("qianfan");
  if (!qianfanKey) {
    return {};
  }
  return { qianfan: { ...buildQianfanProviderConfig(), apiKey: qianfanKey } };
}
