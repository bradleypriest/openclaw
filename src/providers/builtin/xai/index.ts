import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceXAI } from "./interactive-auth.js";

export function registerXaiInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "xai",
    order: 110,
    handler: applyAuthChoiceXAI,
  });
}
