import { registerAnthropicInteractiveAuthHandlers } from "../anthropic/index.js";
import { registerApiKeyInteractiveAuthHandlers } from "../api-key/index.js";
import { registerChutesInteractiveAuthHandlers } from "../chutes/index.js";
import { registerCopilotProxyInteractiveAuthHandlers } from "../copilot-proxy/index.js";
import { registerGitHubCopilotInteractiveAuthHandlers } from "../github-copilot/index.js";
import { registerGoogleAntigravityInteractiveAuthHandlers } from "../google-antigravity/index.js";
import { registerGoogleGeminiCliInteractiveAuthHandlers } from "../google-gemini-cli/index.js";
import { registerMiniMaxInteractiveAuthHandlers } from "../minimax/index.js";
import { registerOpenAIInteractiveAuthHandlers } from "../openai/index.js";
import { registerQwenPortalInteractiveAuthHandlers } from "../qwen-portal/index.js";
import { registerXaiInteractiveAuthHandlers } from "../xai/index.js";

let registered = false;

export function ensureBuiltinInteractiveAuthHandlersRegistered(): void {
  if (registered) {
    return;
  }

  registerAnthropicInteractiveAuthHandlers();
  registerOpenAIInteractiveAuthHandlers();
  registerChutesInteractiveAuthHandlers();
  registerApiKeyInteractiveAuthHandlers();
  registerMiniMaxInteractiveAuthHandlers();
  registerGitHubCopilotInteractiveAuthHandlers();
  registerGoogleAntigravityInteractiveAuthHandlers();
  registerGoogleGeminiCliInteractiveAuthHandlers();
  registerCopilotProxyInteractiveAuthHandlers();
  registerQwenPortalInteractiveAuthHandlers();
  registerXaiInteractiveAuthHandlers();

  registered = true;
}
