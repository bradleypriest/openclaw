import type { AuthChoice } from "../../../commands/onboard-types.js";
import type { BuiltinNonInteractiveApiKeySpec } from "../api-key/types.js";
import { applyMinimaxApiConfig } from "./config.js";

function applyMinimaxApiChoice(
  config: Parameters<typeof applyMinimaxApiConfig>[0],
  authChoice: AuthChoice,
) {
  const modelId =
    authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
  return applyMinimaxApiConfig(config, modelId);
}

export const MINIMAX_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "minimax-cloud",
    providerId: "minimax",
    profileId: "minimax:default",
    optionKey: "minimaxApiKey",
    flagName: "--minimax-api-key",
    envVar: "MINIMAX_API_KEY",
    applyConfig: (config, authChoice) => applyMinimaxApiChoice(config, authChoice),
  },
  {
    authChoice: "minimax-api",
    providerId: "minimax",
    profileId: "minimax:default",
    optionKey: "minimaxApiKey",
    flagName: "--minimax-api-key",
    envVar: "MINIMAX_API_KEY",
    applyConfig: (config, authChoice) => applyMinimaxApiChoice(config, authChoice),
  },
  {
    authChoice: "minimax-api-lightning",
    providerId: "minimax",
    profileId: "minimax:default",
    optionKey: "minimaxApiKey",
    flagName: "--minimax-api-key",
    envVar: "MINIMAX_API_KEY",
    applyConfig: (config, authChoice) => applyMinimaxApiChoice(config, authChoice),
  },
];

export const MINIMAX_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  minimax: "minimax-api",
};
