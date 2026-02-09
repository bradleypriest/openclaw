import type {
  BuiltinImplicitProviderConfig,
  BuiltinImplicitProviderResolverContext,
  BuiltinImplicitProviderResolverResult,
} from "../implicit-types.js";

const QWEN_PORTAL_IMPLICIT_BASE_URL = "https://portal.qwen.ai/v1";
const QWEN_PORTAL_IMPLICIT_DEFAULT_CONTEXT_WINDOW = 128000;
const QWEN_PORTAL_IMPLICIT_DEFAULT_MAX_TOKENS = 8192;
const QWEN_PORTAL_IMPLICIT_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const QWEN_PORTAL_IMPLICIT_OAUTH_PLACEHOLDER = "qwen-oauth";

export function buildQwenPortalImplicitProviderConfig(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: QWEN_PORTAL_IMPLICIT_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: "coder-model",
        name: "Qwen Coder",
        reasoning: false,
        input: ["text"],
        cost: QWEN_PORTAL_IMPLICIT_DEFAULT_COST,
        contextWindow: QWEN_PORTAL_IMPLICIT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_PORTAL_IMPLICIT_DEFAULT_MAX_TOKENS,
      },
      {
        id: "vision-model",
        name: "Qwen Vision",
        reasoning: false,
        input: ["text", "image"],
        cost: QWEN_PORTAL_IMPLICIT_DEFAULT_COST,
        contextWindow: QWEN_PORTAL_IMPLICIT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_PORTAL_IMPLICIT_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export function resolveQwenPortalImplicitProviders(
  params: BuiltinImplicitProviderResolverContext,
): BuiltinImplicitProviderResolverResult {
  if (params.listProfileIdsForProvider("qwen-portal").length === 0) {
    return {};
  }
  return {
    "qwen-portal": {
      ...buildQwenPortalImplicitProviderConfig(),
      apiKey: QWEN_PORTAL_IMPLICIT_OAUTH_PLACEHOLDER,
    },
  };
}
