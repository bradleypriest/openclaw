import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceOAuth } from "./interactive-auth.js";

export function registerChutesInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "chutes",
    order: 30,
    handler: applyAuthChoiceOAuth,
  });
}
