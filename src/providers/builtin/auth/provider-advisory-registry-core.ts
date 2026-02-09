import type { AuthProfileStore } from "../../../agents/auth-profiles.js";
import { normalizeProviderId } from "../../provider-id.js";

type BuiltinProviderAdvisoryHandlers = {
  resolveMissingApiKeyError?: (store: AuthProfileStore) => string | undefined;
  resolveModelConfigWarning?: (store: AuthProfileStore) => string | undefined;
  resolveMissingAuthHint?: () => string | undefined;
};

const providerAdvisoryHandlers = new Map<string, BuiltinProviderAdvisoryHandlers>();

export function registerBuiltinProviderAdvisoryHandlers(
  handlers: Array<{ providerId: string; handlers: BuiltinProviderAdvisoryHandlers }>,
): void {
  for (const registration of handlers) {
    const providerId = normalizeProviderId(registration.providerId);
    if (!providerId || providerAdvisoryHandlers.has(providerId)) {
      continue;
    }
    providerAdvisoryHandlers.set(providerId, registration.handlers);
  }
}

export function resolveBuiltinProviderAdvisoryHandlers(
  providerRaw: string,
): BuiltinProviderAdvisoryHandlers | undefined {
  return providerAdvisoryHandlers.get(normalizeProviderId(providerRaw));
}
