import { applyAuthChoiceApiProviders } from "../../../commands/auth-choice.apply.api-providers.js";
import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";

export function registerApiKeyInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "api-providers",
    order: 40,
    handler: applyAuthChoiceApiProviders,
  });
}
