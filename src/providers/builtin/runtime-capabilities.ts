import { hasBuiltinProviderTag } from "./runtime/provider-tags.js";

const GOOGLE_MODEL_APIS = new Set([
  "google-antigravity",
  "google-gemini-cli",
  "google-generative-ai",
]);

export function isAnthropicProvider(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "anthropic");
}

export function isOpenRouterProvider(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "openrouter");
}

export function isCopilotProvider(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "copilot");
}

export function isOpenAiFamilyProvider(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "openai-family");
}

export function isGoogleProvider(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "google-provider");
}

export function isGoogleModelApi(api?: string | null): boolean {
  if (!api?.trim()) {
    return false;
  }
  return GOOGLE_MODEL_APIS.has(api.trim().toLowerCase());
}

export function isGoogleAntigravityProvider(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "google-antigravity");
}

export function isAntigravityClaudeModel(params: {
  api?: string | null;
  provider?: string | null;
  modelId?: string | null;
}): boolean {
  const provider = params.provider ?? undefined;
  const api = params.api ?? undefined;
  if (!isGoogleAntigravityProvider(provider) && !isGoogleAntigravityProvider(api)) {
    return false;
  }
  return params.modelId?.toLowerCase().includes("claude") ?? false;
}

export function requiresOAuthProjectId(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "requires-oauth-project-id");
}

export function supportsCacheRetentionStreamParam(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "supports-cache-retention");
}

export function shouldSanitizeGeminiThoughtSignatures(provider?: string): boolean {
  return hasBuiltinProviderTag(provider, "sanitize-gemini-thought-signatures");
}

export function isCacheTtlEligibleProvider(params: { provider: string; modelId: string }): boolean {
  const normalizedModelId = params.modelId.toLowerCase();
  if (isAnthropicProvider(params.provider)) {
    return true;
  }
  if (isOpenRouterProvider(params.provider) && normalizedModelId.startsWith("anthropic/")) {
    return true;
  }
  return false;
}
