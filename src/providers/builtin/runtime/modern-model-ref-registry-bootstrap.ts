import { isAnthropicModernModelId } from "../anthropic/live-models.js";
import { isGoogleAntigravityModernModelId } from "../google-antigravity/live-models.js";
import { isGoogleModernModelId } from "../google/live-models.js";
import { isMiniMaxModernModelId } from "../minimax/live-models.js";
import { isOpenAiCodexModernModelId, isOpenAiModernModelId } from "../openai/live-models.js";
import { isOpenCodeModernModelId } from "../opencode/live-models.js";
import { isOpenRouterModernModelId } from "../openrouter/live-models.js";
import { isXaiModernModelId } from "../xai/live-models.js";
import { isZaiModernModelId } from "../zai/live-models.js";
import { registerBuiltinModernModelRefHooks } from "./modern-model-ref-registry-core.js";

let registered = false;

export function ensureBuiltinModernModelRefHooksRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinModernModelRefHooks([
    { providerId: "anthropic", hook: isAnthropicModernModelId },
    { providerId: "openai", hook: isOpenAiModernModelId },
    { providerId: "openai-codex", hook: isOpenAiCodexModernModelId },
    { providerId: "google", hook: isGoogleModernModelId },
    { providerId: "google-gemini-cli", hook: isGoogleModernModelId },
    { providerId: "google-antigravity", hook: isGoogleAntigravityModernModelId },
    { providerId: "zai", hook: isZaiModernModelId },
    { providerId: "minimax", hook: isMiniMaxModernModelId },
    { providerId: "xai", hook: isXaiModernModelId },
    { providerId: "openrouter", hook: isOpenRouterModernModelId },
    { providerId: "opencode", hook: isOpenCodeModernModelId },
  ]);

  registered = true;
}
