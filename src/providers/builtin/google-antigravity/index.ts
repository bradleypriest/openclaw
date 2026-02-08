import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceGoogleAntigravity } from "./interactive-auth.js";

export function registerGoogleAntigravityInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "google-antigravity",
    order: 70,
    handler: applyAuthChoiceGoogleAntigravity,
  });
}
