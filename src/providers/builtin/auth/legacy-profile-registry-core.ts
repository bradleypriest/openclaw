import { normalizeProviderId } from "../../provider-id.js";

type BuiltinLegacyProfileRules = {
  defaultOAuthProfileId?: string;
  deprecatedProfileIds?: string[];
};

const legacyProfileRules = new Map<string, BuiltinLegacyProfileRules>();

export function registerBuiltinLegacyProfileRules(
  rules: Array<{ providerId: string; rules: BuiltinLegacyProfileRules }>,
): void {
  for (const registration of rules) {
    const providerId = normalizeProviderId(registration.providerId);
    if (!providerId || legacyProfileRules.has(providerId)) {
      continue;
    }
    legacyProfileRules.set(providerId, registration.rules);
  }
}

export function resolveBuiltinLegacyProfileRules(
  providerRaw: string,
): BuiltinLegacyProfileRules | undefined {
  return legacyProfileRules.get(normalizeProviderId(providerRaw));
}
