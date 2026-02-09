import type { ThoughtSignatureSanitizationPolicy } from "../runtime/thought-signature-registry-core.js";

const GEMINI_SANITIZATION_POLICY: ThoughtSignatureSanitizationPolicy = {
  allowBase64Only: true,
  includeCamelCase: true,
};

export function resolveOpenCodeThoughtSignatureSanitizationPolicy(
  modelId: string,
): ThoughtSignatureSanitizationPolicy | undefined {
  return modelId.toLowerCase().includes("gemini") ? GEMINI_SANITIZATION_POLICY : undefined;
}
