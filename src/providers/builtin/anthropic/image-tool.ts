import type { BuiltinPreferredVisionModelResolverContext } from "../image-tool-registry-core.js";
import { normalizeProviderId } from "../../provider-id.js";

export const ANTHROPIC_IMAGE_PRIMARY_MODEL_REF = "anthropic/claude-opus-4-6";
export const ANTHROPIC_IMAGE_FALLBACK_MODEL_REF = "anthropic/claude-opus-4-5";

export function resolveAnthropicPreferredVisionModel(
  params: BuiltinPreferredVisionModelResolverContext,
): string | null {
  if (normalizeProviderId(params.provider) !== "anthropic") {
    return null;
  }
  return params.providerHasAuth ? ANTHROPIC_IMAGE_PRIMARY_MODEL_REF : null;
}

export function resolveAnthropicCrossProviderVisionModel(params: {
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): { primary: string; fallbacks?: string[] } | null {
  if (params.openAiHasAuth || !params.anthropicHasAuth) {
    return null;
  }
  return {
    primary: ANTHROPIC_IMAGE_PRIMARY_MODEL_REF,
    fallbacks: [ANTHROPIC_IMAGE_FALLBACK_MODEL_REF],
  };
}
