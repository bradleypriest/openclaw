import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceOpenAI } from "./interactive-auth.js";

export function registerOpenAIInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "openai",
    order: 20,
    handler: applyAuthChoiceOpenAI,
  });
}
