import type { BuiltinPreferredVisionModelResolverContext } from "../image-tool-registry-core.js";
import { normalizeProviderId } from "../../provider-id.js";
import { ANTHROPIC_IMAGE_FALLBACK_MODEL_REF } from "../anthropic/image-tool.js";

export const OPENAI_IMAGE_MODEL_REF = "openai/gpt-5-mini";

export function resolveOpenAiPreferredVisionModel(
  params: BuiltinPreferredVisionModelResolverContext,
): string | null {
  if (normalizeProviderId(params.provider) !== "openai") {
    return null;
  }
  return params.providerHasAuth ? OPENAI_IMAGE_MODEL_REF : null;
}

export function resolveOpenAiCrossProviderVisionModel(params: {
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): { primary: string; fallbacks?: string[] } | null {
  if (!params.openAiHasAuth) {
    return null;
  }
  return {
    primary: OPENAI_IMAGE_MODEL_REF,
    ...(params.anthropicHasAuth ? { fallbacks: [ANTHROPIC_IMAGE_FALLBACK_MODEL_REF] } : {}),
  };
}
