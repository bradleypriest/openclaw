import type { ApplyAuthChoiceHandler } from "../../../commands/auth-choice.apply.js";
import { applyAuthChoiceApiProviders } from "../../../commands/auth-choice.apply.api-providers.js";
import { applyAuthChoiceAnthropic } from "../anthropic/interactive-auth.js";
import { applyAuthChoiceOAuth } from "../chutes/interactive-auth.js";
import { applyAuthChoiceCopilotProxy } from "../copilot-proxy/interactive-auth.js";
import { applyAuthChoiceGitHubCopilot } from "../github-copilot/interactive-auth.js";
import { applyAuthChoiceGoogleAntigravity } from "../google-antigravity/interactive-auth.js";
import { applyAuthChoiceGoogleGeminiCli } from "../google-gemini-cli/interactive-auth.js";
import { applyAuthChoiceMiniMax } from "../minimax/interactive-auth.js";
import { applyAuthChoiceOpenAI } from "../openai/interactive-auth.js";
import { applyAuthChoiceQwenPortal } from "../qwen-portal/interactive-auth.js";
import { applyAuthChoiceXAI } from "../xai/interactive-auth.js";

export const BUILTIN_INTERACTIVE_AUTH_HANDLERS: ApplyAuthChoiceHandler[] = [
  applyAuthChoiceAnthropic,
  applyAuthChoiceOpenAI,
  applyAuthChoiceOAuth,
  applyAuthChoiceApiProviders,
  applyAuthChoiceMiniMax,
  applyAuthChoiceGitHubCopilot,
  applyAuthChoiceGoogleAntigravity,
  applyAuthChoiceGoogleGeminiCli,
  applyAuthChoiceCopilotProxy,
  applyAuthChoiceQwenPortal,
  applyAuthChoiceXAI,
];
