import type {
  BuiltinPreferredVisionModelResolverContext,
  ProviderVisionModelCandidate,
} from "../image-tool-registry-core.js";
import { normalizeProviderId } from "../../provider-id.js";

export const MINIMAX_IMAGE_MODEL_REF = "minimax/MiniMax-VL-01";

export function resolveMiniMaxPreferredVisionModel(
  params: BuiltinPreferredVisionModelResolverContext,
): string | null {
  if (normalizeProviderId(params.provider) !== "minimax") {
    return null;
  }
  return params.providerHasAuth ? MINIMAX_IMAGE_MODEL_REF : null;
}

export function pickMiniMaxConfiguredVisionModel(
  models: ProviderVisionModelCandidate[],
): ProviderVisionModelCandidate | undefined {
  return models.find(
    (model) => (model?.id ?? "").trim() === "MiniMax-VL-01" && hasImageInput(model),
  );
}

function hasImageInput(model: ProviderVisionModelCandidate | undefined): boolean {
  return Array.isArray(model?.input) && model.input.includes("image");
}
