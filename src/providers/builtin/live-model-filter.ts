import { normalizeProviderId } from "../provider-id.js";
import { isAnthropicModernModelId } from "./anthropic/live-models.js";
import { isGoogleAntigravityModernModelId } from "./google-antigravity/live-models.js";
import { isGoogleModernModelId } from "./google/live-models.js";
import { isMiniMaxModernModelId } from "./minimax/live-models.js";
import { isOpenAiCodexModernModelId, isOpenAiModernModelId } from "./openai/live-models.js";
import { isOpenCodeModernModelId } from "./opencode/live-models.js";
import { isOpenRouterModernModelId } from "./openrouter/live-models.js";
import { isXaiModernModelId } from "./xai/live-models.js";
import { isZaiModernModelId } from "./zai/live-models.js";

export type BuiltinModernModelRef = {
  provider?: string | null;
  id?: string | null;
};

export function isBuiltinModernModelRef(ref: BuiltinModernModelRef): boolean {
  const provider = normalizeProviderId(ref.provider ?? "");
  const id = ref.id?.trim().toLowerCase() ?? "";
  if (!provider || !id) {
    return false;
  }

  if (provider === "anthropic") {
    return isAnthropicModernModelId(id);
  }
  if (provider === "openai") {
    return isOpenAiModernModelId(id);
  }
  if (provider === "openai-codex") {
    return isOpenAiCodexModernModelId(id);
  }
  if (provider === "google" || provider === "google-gemini-cli") {
    return isGoogleModernModelId(id);
  }
  if (provider === "google-antigravity") {
    return isGoogleAntigravityModernModelId(id);
  }
  if (provider === "zai") {
    return isZaiModernModelId(id);
  }
  if (provider === "minimax") {
    return isMiniMaxModernModelId(id);
  }
  if (provider === "xai") {
    return isXaiModernModelId(id);
  }
  if (provider === "openrouter") {
    return isOpenRouterModernModelId(id);
  }
  if (provider === "opencode") {
    return isOpenCodeModernModelId(id);
  }
  return false;
}
