import { normalizeProviderId } from "../../provider-id.js";

export type BuiltinModernModelRefHook = (modelId: string) => boolean;

const modernModelRefHooks = new Map<string, BuiltinModernModelRefHook>();

export function registerBuiltinModernModelRefHooks(
  hooks: Array<{ providerId: string; hook: BuiltinModernModelRefHook }>,
): void {
  for (const { providerId, hook } of hooks) {
    const normalized = normalizeProviderId(providerId);
    if (!normalized || modernModelRefHooks.has(normalized)) {
      continue;
    }
    modernModelRefHooks.set(normalized, hook);
  }
}

export function resolveBuiltinModernModelRefHook(
  providerRaw: string,
): BuiltinModernModelRefHook | undefined {
  return modernModelRefHooks.get(normalizeProviderId(providerRaw));
}
