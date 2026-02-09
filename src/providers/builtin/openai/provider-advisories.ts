import type { AuthProfileStore } from "../../../agents/auth-profiles.js";
import {
  resolveOpenAIAuthMissingApiKeyError,
  resolveOpenAICodexDefaultModelWarning,
} from "./codex-advisory.js";

export function resolveOpenAiMissingApiKeyAdvisory(store: AuthProfileStore): string | undefined {
  return resolveOpenAIAuthMissingApiKeyError(store);
}

export function resolveOpenAiModelConfigWarningAdvisory(
  store: AuthProfileStore,
): string | undefined {
  return resolveOpenAICodexDefaultModelWarning(store);
}
