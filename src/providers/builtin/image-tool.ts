import {
  ANTHROPIC_IMAGE_FALLBACK_MODEL_REF,
  ANTHROPIC_IMAGE_PRIMARY_MODEL_REF,
} from "./anthropic/image-tool.js";
import { ensureBuiltinImageToolResolversRegistered } from "./image-tool-registry-bootstrap.js";
import {
  pickConfiguredProviderVisionModelViaRegistry,
  resolveBuiltinCrossProviderVisionModelViaRegistry,
  resolveBuiltinPreferredVisionModelViaRegistry,
  type ProviderVisionModelCandidate,
} from "./image-tool-registry-core.js";
import { OPENAI_IMAGE_MODEL_REF } from "./openai/image-tool.js";

export {
  OPENAI_IMAGE_MODEL_REF,
  ANTHROPIC_IMAGE_PRIMARY_MODEL_REF,
  ANTHROPIC_IMAGE_FALLBACK_MODEL_REF,
};

export function resolveBuiltinPreferredVisionModel(params: {
  provider: string;
  providerHasAuth: boolean;
  providerVisionFromConfig: string | null;
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): string | null {
  ensureBuiltinImageToolResolversRegistered();
  return resolveBuiltinPreferredVisionModelViaRegistry(params);
}

export function pickConfiguredProviderVisionModel(params: {
  provider: string;
  models: ProviderVisionModelCandidate[];
}): ProviderVisionModelCandidate | undefined {
  ensureBuiltinImageToolResolversRegistered();
  return pickConfiguredProviderVisionModelViaRegistry(params);
}

export function resolveBuiltinCrossProviderVisionModel(params: {
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): { primary: string; fallbacks?: string[] } | null {
  ensureBuiltinImageToolResolversRegistered();
  return resolveBuiltinCrossProviderVisionModelViaRegistry(params);
}
