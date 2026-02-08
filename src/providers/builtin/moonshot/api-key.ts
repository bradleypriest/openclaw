import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import {
  applyMoonshotConfig,
  applyMoonshotConfigCn,
  applyMoonshotProviderConfig,
  applyMoonshotProviderConfigCn,
} from "./config.js";
import { MOONSHOT_DEFAULT_MODEL_REF } from "./models.js";

export const MOONSHOT_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "moonshot-api-key",
    tokenProviders: ["moonshot"],
    providerId: "moonshot",
    profileId: "moonshot:default",
    label: "Moonshot",
    keyPrompt: "Enter Moonshot API key",
    optionKey: "moonshotApiKey",
    defaultModel: {
      kind: "standard",
      defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyMoonshotConfig,
      applyProviderConfig: applyMoonshotProviderConfig,
    },
  },
  {
    authChoice: "moonshot-api-key-cn",
    tokenProviders: ["moonshot"],
    providerId: "moonshot",
    profileId: "moonshot:default",
    label: "Moonshot (.cn)",
    keyPrompt: "Enter Moonshot API key (.cn)",
    optionKey: "moonshotApiKey",
    defaultModel: {
      kind: "standard",
      defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyMoonshotConfigCn,
      applyProviderConfig: applyMoonshotProviderConfigCn,
    },
  },
];

export const MOONSHOT_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "moonshot-api-key",
    providerId: "moonshot",
    profileId: "moonshot:default",
    optionKey: "moonshotApiKey",
    flagName: "--moonshot-api-key",
    envVar: "MOONSHOT_API_KEY",
    applyConfig: (config) => applyMoonshotConfig(config),
  },
  {
    authChoice: "moonshot-api-key-cn",
    providerId: "moonshot",
    profileId: "moonshot:default",
    optionKey: "moonshotApiKey",
    flagName: "--moonshot-api-key",
    envVar: "MOONSHOT_API_KEY",
    applyConfig: (config) => applyMoonshotConfigCn(config),
  },
];

export const MOONSHOT_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  moonshot: "moonshot-api-key",
};
