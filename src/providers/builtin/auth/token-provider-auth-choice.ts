import type { AuthChoice } from "../../../commands/onboard-types.js";
import { normalizeProviderId } from "../../../agents/model-selection.js";
import { BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE } from "../api-key/interactive-specs.js";
import { OPENAI_PROVIDER_AUTH_CHOICE_ALIASES } from "../openai/api-key.js";

const BUILTIN_ADDITIONAL_TOKEN_PROVIDER_TO_AUTH_CHOICE: Record<string, AuthChoice> = {
  anthropic: "apiKey",
  ...OPENAI_PROVIDER_AUTH_CHOICE_ALIASES,
};

export function resolveBuiltinAuthChoiceByTokenProvider(
  tokenProviderRaw?: string,
): AuthChoice | undefined {
  const tokenProvider = tokenProviderRaw?.trim();
  if (!tokenProvider) {
    return undefined;
  }

  const normalized = normalizeProviderId(tokenProvider);
  const mapped = BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE.get(normalized);
  if (mapped) {
    return mapped as AuthChoice;
  }
  return BUILTIN_ADDITIONAL_TOKEN_PROVIDER_TO_AUTH_CHOICE[normalized];
}
