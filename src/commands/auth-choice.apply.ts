import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import type { AuthChoice } from "./onboard-types.js";
import { BUILTIN_INTERACTIVE_AUTH_HANDLERS } from "../providers/builtin/auth/interactive-handler-registry.js";

export type ApplyAuthChoiceParams = {
  authChoice: AuthChoice;
  config: OpenClawConfig;
  prompter: WizardPrompter;
  runtime: RuntimeEnv;
  agentDir?: string;
  setDefaultModel: boolean;
  agentId?: string;
  opts?: {
    tokenProvider?: string;
    token?: string;
    cloudflareAiGatewayAccountId?: string;
    cloudflareAiGatewayGatewayId?: string;
    cloudflareAiGatewayApiKey?: string;
    xaiApiKey?: string;
  };
};

export type ApplyAuthChoiceResult = {
  config: OpenClawConfig;
  agentModelOverride?: string;
};

export type ApplyAuthChoiceHandler = (
  params: ApplyAuthChoiceParams,
) => Promise<ApplyAuthChoiceResult | null>;

export async function applyAuthChoice(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult> {
  for (const handler of BUILTIN_INTERACTIVE_AUTH_HANDLERS) {
    const result = await handler(params);
    if (result) {
      return result;
    }
  }

  return { config: params.config };
}
