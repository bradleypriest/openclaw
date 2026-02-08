import type { BuiltinNonInteractiveApiKeySpec } from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import { applyXaiConfig } from "./config.js";

export const XAI_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "xai-api-key",
    providerId: "xai",
    profileId: "xai:default",
    optionKey: "xaiApiKey",
    flagName: "--xai-api-key",
    envVar: "XAI_API_KEY",
    applyConfig: (config) => applyXaiConfig(config),
  },
];

export const XAI_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  xai: "xai-api-key",
};
