import { normalizeProviderId } from "../../provider-id.js";

export type ThoughtSignatureSanitizationPolicy = {
  allowBase64Only?: boolean;
  includeCamelCase?: boolean;
};

export type BuiltinThoughtSignatureSanitizationHook = (
  modelId: string,
) => ThoughtSignatureSanitizationPolicy | undefined;

const thoughtSignatureHooks = new Map<string, BuiltinThoughtSignatureSanitizationHook>();

export function registerBuiltinThoughtSignatureSanitizationHooks(
  hooks: Array<{ providerId: string; hook: BuiltinThoughtSignatureSanitizationHook }>,
): void {
  for (const { providerId, hook } of hooks) {
    const normalized = normalizeProviderId(providerId);
    if (!normalized || thoughtSignatureHooks.has(normalized)) {
      continue;
    }
    thoughtSignatureHooks.set(normalized, hook);
  }
}

export function resolveBuiltinThoughtSignatureSanitizationHook(
  providerRaw: string,
): BuiltinThoughtSignatureSanitizationHook | undefined {
  return thoughtSignatureHooks.get(normalizeProviderId(providerRaw));
}
