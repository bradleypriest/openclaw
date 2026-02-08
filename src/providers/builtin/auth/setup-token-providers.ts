import { normalizeProviderId } from "../../provider-id.js";
import { validateAnthropicSetupToken } from "../anthropic/setup-token.js";

export type BuiltinSetupTokenProviderSpec = {
  providerId: string;
  label: string;
  confirmMessage: string;
  tokenPrompt: string;
  methodLabel: string;
  methodHint: string;
  validateToken: (value: string) => string | undefined;
};

const BUILTIN_SETUP_TOKEN_PROVIDER_SPECS: BuiltinSetupTokenProviderSpec[] = [
  {
    providerId: "anthropic",
    label: "anthropic",
    confirmMessage: "Have you run `claude setup-token` and copied the token?",
    tokenPrompt: "Paste Anthropic setup-token",
    methodLabel: "setup-token (claude)",
    methodHint: "Paste a setup-token from `claude setup-token`",
    validateToken: validateAnthropicSetupToken,
  },
];

const BUILTIN_SETUP_TOKEN_PROVIDER_SPEC_BY_ID = new Map(
  BUILTIN_SETUP_TOKEN_PROVIDER_SPECS.map((entry) => [entry.providerId, entry]),
);

export function listBuiltinSetupTokenProviderSpecs(): BuiltinSetupTokenProviderSpec[] {
  return [...BUILTIN_SETUP_TOKEN_PROVIDER_SPECS];
}

export function resolveBuiltinSetupTokenProviderSpec(
  providerRaw?: string,
): BuiltinSetupTokenProviderSpec | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  const normalized = normalizeProviderId(provider);
  return BUILTIN_SETUP_TOKEN_PROVIDER_SPEC_BY_ID.get(normalized);
}
