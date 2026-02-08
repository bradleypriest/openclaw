import type { AuthProfileStore } from "../../../agents/auth-profiles.js";
import { normalizeProviderId } from "../../provider-id.js";
import {
  resolveOpenAIAuthMissingApiKeyError,
  resolveOpenAICodexDefaultModelWarning,
} from "../openai/codex-advisory.js";

export function resolveProviderMissingApiKeyError(
  provider: string,
  store: AuthProfileStore,
): string | undefined {
  const normalized = normalizeProviderId(provider);
  if (normalized === "openai") {
    return resolveOpenAIAuthMissingApiKeyError(store);
  }
  return undefined;
}

export function resolveProviderModelConfigWarning(
  provider: string,
  store: AuthProfileStore,
): string | undefined {
  const normalized = normalizeProviderId(provider);
  if (normalized === "openai") {
    return resolveOpenAICodexDefaultModelWarning(store);
  }
  return undefined;
}

export function resolveMissingProviderAuthHint(provider: string): string | undefined {
  const normalized = normalizeProviderId(provider);
  if (normalized === "anthropic") {
    return "Run `claude setup-token`, then `openclaw models auth setup-token` or `openclaw configure`.";
  }
  return undefined;
}
