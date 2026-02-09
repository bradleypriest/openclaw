import { normalizeProviderId } from "../../provider-id.js";
import { isAnthropicModernModelId } from "../anthropic/live-models.js";
import { isGoogleAntigravityModernModelId } from "../google-antigravity/live-models.js";
import { isGoogleModernModelId } from "../google/live-models.js";
import { isMiniMaxModernModelId } from "../minimax/live-models.js";
import { isOpenAiCodexModernModelId, isOpenAiModernModelId } from "../openai/live-models.js";
import { isOpenCodeModernModelId } from "../opencode/live-models.js";
import { isOpenRouterModernModelId } from "../openrouter/live-models.js";
import { isXaiModernModelId } from "../xai/live-models.js";
import { isZaiModernModelId } from "../zai/live-models.js";

type BuiltinModernModelRefHook = (modelId: string) => boolean;

const BUILTIN_MODERN_MODEL_REF_HOOKS: Record<string, BuiltinModernModelRefHook> = {
  anthropic: isAnthropicModernModelId,
  openai: isOpenAiModernModelId,
  "openai-codex": isOpenAiCodexModernModelId,
  google: isGoogleModernModelId,
  "google-gemini-cli": isGoogleModernModelId,
  "google-antigravity": isGoogleAntigravityModernModelId,
  zai: isZaiModernModelId,
  minimax: isMiniMaxModernModelId,
  xai: isXaiModernModelId,
  openrouter: isOpenRouterModernModelId,
  opencode: isOpenCodeModernModelId,
};

export function isBuiltinModernModelRefViaHook(params: {
  provider: string;
  modelId: string;
}): boolean {
  const hook = BUILTIN_MODERN_MODEL_REF_HOOKS[normalizeProviderId(params.provider)];
  if (!hook) {
    return false;
  }
  return hook(params.modelId);
}
