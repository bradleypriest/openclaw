import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceAnthropic } from "./interactive-auth.js";

export function registerAnthropicInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "anthropic",
    order: 10,
    handler: applyAuthChoiceAnthropic,
  });
}
