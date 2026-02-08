import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceGitHubCopilot } from "./interactive-auth.js";

export function registerGitHubCopilotInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "github-copilot",
    order: 60,
    handler: applyAuthChoiceGitHubCopilot,
  });
}
