import { normalizeProviderId } from "../../provider-id.js";

type AntigravityThinkingNormalizationHook = (modelId: string) => boolean;

const ANTIGRAVITY_THINKING_NORMALIZATION_HOOKS: Record<
  string,
  AntigravityThinkingNormalizationHook
> = {
  "google-antigravity": (modelId) => modelId.toLowerCase().includes("claude"),
};

export function shouldNormalizeAntigravityThinkingViaHook(params: {
  provider: string;
  modelId: string;
}): boolean {
  const hook = ANTIGRAVITY_THINKING_NORMALIZATION_HOOKS[normalizeProviderId(params.provider)];
  if (!hook) {
    return false;
  }
  return hook(params.modelId);
}
