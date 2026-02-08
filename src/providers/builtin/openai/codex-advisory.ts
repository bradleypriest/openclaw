import type { AuthProfileStore } from "../../../agents/auth-profiles.js";
import { listProfilesForProvider } from "../../../agents/auth-profiles.js";
import { OPENAI_CODEX_DEFAULT_MODEL } from "../../../commands/openai-codex-model-default.js";

export function hasOpenAICodexOAuthProfile(store: AuthProfileStore): boolean {
  return listProfilesForProvider(store, "openai-codex").length > 0;
}

export function resolveOpenAICodexDefaultModelWarning(store: AuthProfileStore): string | undefined {
  if (!hasOpenAICodexOAuthProfile(store)) {
    return undefined;
  }
  return `Detected OpenAI Codex OAuth. Consider setting agents.defaults.model to ${OPENAI_CODEX_DEFAULT_MODEL}.`;
}

export function resolveOpenAIAuthMissingApiKeyError(store: AuthProfileStore): string | undefined {
  if (!hasOpenAICodexOAuthProfile(store)) {
    return undefined;
  }
  return 'No API key found for provider "openai". You are authenticated with OpenAI Codex OAuth. Use openai-codex/gpt-5.3-codex (OAuth) or set OPENAI_API_KEY to use openai/gpt-5.1-codex.';
}
