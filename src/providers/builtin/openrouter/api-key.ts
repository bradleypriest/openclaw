import type { AuthChoice } from "../../../commands/onboard-types.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import { OPENROUTER_DEFAULT_MODEL_REF } from "../../../commands/onboard-auth.credentials.js";
import { applyOpenrouterConfig, applyOpenrouterProviderConfig } from "./config.js";

export const OPENROUTER_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "openrouter-api-key",
    tokenProviders: ["openrouter"],
    providerId: "openrouter",
    profileId: "openrouter:default",
    label: "OpenRouter",
    keyPrompt: "Enter OpenRouter API key",
    optionKey: "openrouterApiKey",
    defaultModel: {
      kind: "standard",
      defaultModel: OPENROUTER_DEFAULT_MODEL_REF,
      noteDefault: OPENROUTER_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyOpenrouterConfig,
      applyProviderConfig: applyOpenrouterProviderConfig,
    },
  },
];

export const OPENROUTER_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "openrouter-api-key",
    providerId: "openrouter",
    profileId: "openrouter:default",
    optionKey: "openrouterApiKey",
    flagName: "--openrouter-api-key",
    envVar: "OPENROUTER_API_KEY",
    applyConfig: (config) => applyOpenrouterConfig(config),
  },
];

export const OPENROUTER_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  openrouter: "openrouter-api-key",
};
