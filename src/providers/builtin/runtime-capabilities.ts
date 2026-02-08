import { normalizeProviderId } from "../provider-id.js";
import { BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID } from "./implicit-providers.js";

const OPENAI_FAMILY_PROVIDER_IDS = new Set(["openai", "openai-codex"]);
const GOOGLE_PROVIDER_IDS = new Set(["google-antigravity", "google-gemini-cli"]);
const GOOGLE_MODEL_APIS = new Set([
  "google-antigravity",
  "google-gemini-cli",
  "google-generative-ai",
]);

export function isAnthropicProvider(provider?: string): boolean {
  if (!provider?.trim()) {
    return false;
  }
  return normalizeProviderId(provider) === "anthropic";
}

export function isOpenRouterProvider(provider?: string): boolean {
  if (!provider?.trim()) {
    return false;
  }
  return normalizeProviderId(provider) === "openrouter";
}

export function isCopilotProvider(provider?: string): boolean {
  if (!provider?.trim()) {
    return false;
  }
  return normalizeProviderId(provider) === BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID;
}

export function isOpenAiFamilyProvider(provider?: string): boolean {
  if (!provider?.trim()) {
    return false;
  }
  return OPENAI_FAMILY_PROVIDER_IDS.has(normalizeProviderId(provider));
}

export function isGoogleProvider(provider?: string): boolean {
  if (!provider?.trim()) {
    return false;
  }
  return GOOGLE_PROVIDER_IDS.has(normalizeProviderId(provider));
}

export function isGoogleModelApi(api?: string | null): boolean {
  if (!api?.trim()) {
    return false;
  }
  return GOOGLE_MODEL_APIS.has(api.trim().toLowerCase());
}

export function isGoogleAntigravityProvider(provider?: string): boolean {
  if (!provider?.trim()) {
    return false;
  }
  return normalizeProviderId(provider) === "google-antigravity";
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
  return isGoogleProvider(provider);
}

export function supportsCacheRetentionStreamParam(provider?: string): boolean {
  return isAnthropicProvider(provider);
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
