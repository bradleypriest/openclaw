import { normalizeProviderId } from "../provider-id.js";

export const OPENAI_IMAGE_MODEL_REF = "openai/gpt-5-mini";
export const ANTHROPIC_IMAGE_PRIMARY_MODEL_REF = "anthropic/claude-opus-4-6";
export const ANTHROPIC_IMAGE_FALLBACK_MODEL_REF = "anthropic/claude-opus-4-5";
const MINIMAX_IMAGE_MODEL_REF = "minimax/MiniMax-VL-01";

type ProviderVisionModelCandidate = {
  id?: string;
  input?: string[];
};

function hasImageInput(model: ProviderVisionModelCandidate | undefined): boolean {
  return Array.isArray(model?.input) && model.input.includes("image");
}

export function resolveBuiltinPreferredVisionModel(params: {
  provider: string;
  providerHasAuth: boolean;
  providerVisionFromConfig: string | null;
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): string | null {
  const provider = normalizeProviderId(params.provider);

  if (provider === "minimax" && params.providerHasAuth) {
    return MINIMAX_IMAGE_MODEL_REF;
  }
  if (params.providerHasAuth && params.providerVisionFromConfig) {
    return params.providerVisionFromConfig;
  }
  if (provider === "openai" && params.openAiHasAuth) {
    return OPENAI_IMAGE_MODEL_REF;
  }
  if (provider === "anthropic" && params.anthropicHasAuth) {
    return ANTHROPIC_IMAGE_PRIMARY_MODEL_REF;
  }

  return null;
}

export function pickConfiguredProviderVisionModel(params: {
  provider: string;
  models: ProviderVisionModelCandidate[];
}): ProviderVisionModelCandidate | undefined {
  const provider = normalizeProviderId(params.provider);
  if (provider === "minimax") {
    const minimaxVisionModel = params.models.find(
      (model) => (model?.id ?? "").trim() === "MiniMax-VL-01" && hasImageInput(model),
    );
    if (minimaxVisionModel) {
      return minimaxVisionModel;
    }
  }
  return params.models.find((model) => Boolean((model?.id ?? "").trim()) && hasImageInput(model));
}

export function resolveBuiltinCrossProviderVisionModel(params: {
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): { primary: string; fallbacks?: string[] } | null {
  if (params.openAiHasAuth) {
    return {
      primary: OPENAI_IMAGE_MODEL_REF,
      ...(params.anthropicHasAuth ? { fallbacks: [ANTHROPIC_IMAGE_FALLBACK_MODEL_REF] } : {}),
    };
  }
  if (params.anthropicHasAuth) {
    return {
      primary: ANTHROPIC_IMAGE_PRIMARY_MODEL_REF,
      fallbacks: [ANTHROPIC_IMAGE_FALLBACK_MODEL_REF],
    };
  }
  return null;
}
