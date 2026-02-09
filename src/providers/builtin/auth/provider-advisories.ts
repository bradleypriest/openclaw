import type { AuthProfileStore } from "../../../agents/auth-profiles.js";
import { ensureBuiltinProviderAdvisoryHandlersRegistered } from "./provider-advisory-registry-bootstrap.js";
import { resolveBuiltinProviderAdvisoryHandlers } from "./provider-advisory-registry-core.js";

export function resolveProviderMissingApiKeyError(
  provider: string,
  store: AuthProfileStore,
): string | undefined {
  ensureBuiltinProviderAdvisoryHandlersRegistered();
  return resolveBuiltinProviderAdvisoryHandlers(provider)?.resolveMissingApiKeyError?.(store);
}

export function resolveProviderModelConfigWarning(
  provider: string,
  store: AuthProfileStore,
): string | undefined {
  ensureBuiltinProviderAdvisoryHandlersRegistered();
  return resolveBuiltinProviderAdvisoryHandlers(provider)?.resolveModelConfigWarning?.(store);
}

export function resolveMissingProviderAuthHint(provider: string): string | undefined {
  ensureBuiltinProviderAdvisoryHandlersRegistered();
  return resolveBuiltinProviderAdvisoryHandlers(provider)?.resolveMissingAuthHint?.();
}
