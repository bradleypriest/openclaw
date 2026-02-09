import { normalizeProviderId } from "../../provider-id.js";

export type BuiltinAntigravityThinkingNormalizationHook = (modelId: string) => boolean;

const antigravityThinkingHooks = new Map<string, BuiltinAntigravityThinkingNormalizationHook>();

export function registerBuiltinAntigravityThinkingNormalizationHooks(
  hooks: Array<{ providerId: string; hook: BuiltinAntigravityThinkingNormalizationHook }>,
): void {
  for (const { providerId, hook } of hooks) {
    const normalized = normalizeProviderId(providerId);
    if (!normalized || antigravityThinkingHooks.has(normalized)) {
      continue;
    }
    antigravityThinkingHooks.set(normalized, hook);
  }
}

export function resolveBuiltinAntigravityThinkingNormalizationHook(
  providerRaw: string,
): BuiltinAntigravityThinkingNormalizationHook | undefined {
  return antigravityThinkingHooks.get(normalizeProviderId(providerRaw));
}
