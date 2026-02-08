import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import {
  applyXiaomiConfig,
  applyXiaomiProviderConfig,
  XIAOMI_DEFAULT_MODEL_REF,
} from "./config.js";

export const XIAOMI_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "xiaomi-api-key",
    tokenProviders: ["xiaomi"],
    providerId: "xiaomi",
    profileId: "xiaomi:default",
    label: "Xiaomi",
    keyPrompt: "Enter Xiaomi API key",
    optionKey: "xiaomiApiKey",
    defaultModel: {
      kind: "standard",
      defaultModel: XIAOMI_DEFAULT_MODEL_REF,
      noteDefault: XIAOMI_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyXiaomiConfig,
      applyProviderConfig: applyXiaomiProviderConfig,
    },
  },
];

export const XIAOMI_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "xiaomi-api-key",
    providerId: "xiaomi",
    profileId: "xiaomi:default",
    optionKey: "xiaomiApiKey",
    flagName: "--xiaomi-api-key",
    envVar: "XIAOMI_API_KEY",
    applyConfig: (config) => applyXiaomiConfig(config),
  },
];

export const XIAOMI_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  xiaomi: "xiaomi-api-key",
};
