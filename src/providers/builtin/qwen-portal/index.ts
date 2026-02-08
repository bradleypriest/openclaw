import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceQwenPortal } from "./interactive-auth.js";

export function registerQwenPortalInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "qwen-portal",
    order: 100,
    handler: applyAuthChoiceQwenPortal,
  });
}
