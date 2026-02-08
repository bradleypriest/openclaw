import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import { applyVeniceConfig, applyVeniceProviderConfig } from "./config.js";
import { VENICE_DEFAULT_MODEL_REF } from "./models.js";

export const VENICE_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "venice-api-key",
    tokenProviders: ["venice"],
    providerId: "venice",
    profileId: "venice:default",
    label: "Venice AI",
    keyPrompt: "Enter Venice AI API key",
    optionKey: "veniceApiKey",
    noteBeforePrompt: {
      title: "Venice AI",
      message: [
        "Venice AI provides privacy-focused inference with uncensored models.",
        "Get your API key at: https://venice.ai/settings/api",
        "Supports 'private' (fully private) and 'anonymized' (proxy) modes.",
      ].join("\n"),
    },
    defaultModel: {
      kind: "standard",
      defaultModel: VENICE_DEFAULT_MODEL_REF,
      noteDefault: VENICE_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyVeniceConfig,
      applyProviderConfig: applyVeniceProviderConfig,
    },
  },
];

export const VENICE_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "venice-api-key",
    providerId: "venice",
    profileId: "venice:default",
    optionKey: "veniceApiKey",
    flagName: "--venice-api-key",
    envVar: "VENICE_API_KEY",
    applyConfig: (config) => applyVeniceConfig(config),
  },
];

export const VENICE_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  venice: "venice-api-key",
};
