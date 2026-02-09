import { normalizeProviderId } from "../../provider-id.js";

export type ThoughtSignatureSanitizationPolicy = {
  allowBase64Only?: boolean;
  includeCamelCase?: boolean;
};

type ThoughtSignatureSanitizationHook = (
  modelId: string,
) => ThoughtSignatureSanitizationPolicy | undefined;

const GEMINI_SANITIZATION_POLICY: ThoughtSignatureSanitizationPolicy = {
  allowBase64Only: true,
  includeCamelCase: true,
};

const THOUGHT_SIGNATURE_SANITIZATION_HOOKS: Record<string, ThoughtSignatureSanitizationHook> = {
  openrouter: (modelId) =>
    modelId.toLowerCase().includes("gemini") ? GEMINI_SANITIZATION_POLICY : undefined,
  opencode: (modelId) =>
    modelId.toLowerCase().includes("gemini") ? GEMINI_SANITIZATION_POLICY : undefined,
};

export function resolveThoughtSignatureSanitizationViaHook(params: {
  provider: string;
  modelId: string;
}): ThoughtSignatureSanitizationPolicy | undefined {
  const hook = THOUGHT_SIGNATURE_SANITIZATION_HOOKS[normalizeProviderId(params.provider)];
  if (!hook) {
    return undefined;
  }
  return hook(params.modelId);
}
