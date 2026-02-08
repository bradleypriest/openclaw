import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceCopilotProxy } from "./interactive-auth.js";

export function registerCopilotProxyInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "copilot-proxy",
    order: 90,
    handler: applyAuthChoiceCopilotProxy,
  });
}
