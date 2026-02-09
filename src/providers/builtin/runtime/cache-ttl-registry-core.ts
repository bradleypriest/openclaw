import { normalizeProviderId } from "../../provider-id.js";

export type BuiltinCacheTtlEligibilityHook = (modelId: string) => boolean;

const cacheTtlHooks = new Map<string, BuiltinCacheTtlEligibilityHook>();

export function registerBuiltinCacheTtlEligibilityHooks(
  hooks: Array<{ providerId: string; hook: BuiltinCacheTtlEligibilityHook }>,
): void {
  for (const { providerId, hook } of hooks) {
    const normalized = normalizeProviderId(providerId);
    if (!normalized || cacheTtlHooks.has(normalized)) {
      continue;
    }
    cacheTtlHooks.set(normalized, hook);
  }
}

export function resolveBuiltinCacheTtlEligibilityHook(
  providerRaw: string,
): BuiltinCacheTtlEligibilityHook | undefined {
  return cacheTtlHooks.get(normalizeProviderId(providerRaw));
}
