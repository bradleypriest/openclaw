import { shouldNormalizeAntigravityThinkingViaHook } from "./runtime/antigravity-thinking-normalization.js";
import { isCacheTtlEligibleViaProviderHook } from "./runtime/cache-ttl-eligibility.js";
import { hasBuiltinProviderTag } from "./runtime/provider-tags.js";
import {
  resolveThoughtSignatureSanitizationViaHook,
  type ThoughtSignatureSanitizationPolicy,
} from "./runtime/thought-signature-sanitization.js";

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
  const antigravityProvider =
    (isGoogleAntigravityProvider(provider) ? provider : undefined) ??
    (isGoogleAntigravityProvider(api) ? api : undefined);
  if (!antigravityProvider) {
    return false;
  }
  return shouldNormalizeAntigravityThinkingViaHook({
    provider: antigravityProvider,
    modelId: params.modelId ?? "",
  });
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

export function resolveProviderThoughtSignatureSanitizationPolicy(params: {
  provider?: string | null;
  modelId?: string | null;
}): ThoughtSignatureSanitizationPolicy | undefined {
  if (!shouldSanitizeGeminiThoughtSignatures(params.provider ?? undefined)) {
    return undefined;
  }
  return resolveThoughtSignatureSanitizationViaHook({
    provider: params.provider ?? "",
    modelId: params.modelId ?? "",
  });
}

export function isCacheTtlEligibleProvider(params: { provider: string; modelId: string }): boolean {
  if (hasBuiltinProviderTag(params.provider, "cache-ttl-eligible")) {
    return true;
  }
  if (!hasBuiltinProviderTag(params.provider, "cache-ttl-via-hook")) {
    return false;
  }
  return isCacheTtlEligibleViaProviderHook({
    provider: params.provider,
    modelId: params.modelId,
  });
}
