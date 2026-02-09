import { isGoogleAntigravityThinkingNormalizationModel } from "../google-antigravity/antigravity-thinking.js";
import { registerBuiltinAntigravityThinkingNormalizationHooks } from "./antigravity-thinking-registry-core.js";

let registered = false;

export function ensureBuiltinAntigravityThinkingNormalizationHooksRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinAntigravityThinkingNormalizationHooks([
    {
      providerId: "google-antigravity",
      hook: isGoogleAntigravityThinkingNormalizationModel,
    },
  ]);

  registered = true;
}
