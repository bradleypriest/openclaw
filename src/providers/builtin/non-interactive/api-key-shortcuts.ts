import type { AuthChoice, OnboardOptions } from "../../../commands/onboard-types.js";
import { normalizeProviderId } from "../../provider-id.js";
import { BUILTIN_NON_INTERACTIVE_API_KEY_SPECS } from "../api-key/non-interactive-specs.js";

export type BuiltinNonInteractiveAuthChoiceFlag = {
  flag: keyof OnboardOptions;
  authChoice: AuthChoice;
  label: string;
};

const EXTRA_FLAGS: BuiltinNonInteractiveAuthChoiceFlag[] = [
  { flag: "anthropicApiKey", authChoice: "apiKey", label: "--anthropic-api-key" },
  { flag: "openaiApiKey", authChoice: "openai-api-key", label: "--openai-api-key" },
  { flag: "minimaxApiKey", authChoice: "minimax-api", label: "--minimax-api-key" },
];

const BUILTIN_NON_INTERACTIVE_AUTH_CHOICE_FLAGS: BuiltinNonInteractiveAuthChoiceFlag[] = (() => {
  const flags = [...EXTRA_FLAGS];
  const seen = new Set(flags.map((entry) => entry.flag));
  for (const spec of BUILTIN_NON_INTERACTIVE_API_KEY_SPECS) {
    if (!spec.optionKey || seen.has(spec.optionKey)) {
      continue;
    }
    flags.push({
      flag: spec.optionKey,
      authChoice: spec.authChoice,
      label: spec.flagName,
    });
    seen.add(spec.optionKey);
  }
  return flags;
})();

const BUILTIN_API_KEY_OPTION_BY_PROVIDER: Record<string, keyof OnboardOptions> = (() => {
  const entries: Array<[string, keyof OnboardOptions]> = [
    ["anthropic", "anthropicApiKey"],
    ["openai", "openaiApiKey"],
  ];

  for (const spec of BUILTIN_NON_INTERACTIVE_API_KEY_SPECS) {
    if (!spec.optionKey) {
      continue;
    }
    entries.push([normalizeProviderId(spec.providerId), spec.optionKey]);
  }

  return Object.fromEntries(entries);
})();

export function listBuiltinNonInteractiveAuthChoiceFlags(): BuiltinNonInteractiveAuthChoiceFlag[] {
  return BUILTIN_NON_INTERACTIVE_AUTH_CHOICE_FLAGS;
}

export function resolveBuiltinApiKeyOptionKeyByProvider(
  providerRaw?: string,
): keyof OnboardOptions | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  return BUILTIN_API_KEY_OPTION_BY_PROVIDER[normalizeProviderId(provider)];
}
