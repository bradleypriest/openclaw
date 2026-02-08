import type { AuthChoice } from "../../../commands/onboard-types.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import { SYNTHETIC_DEFAULT_MODEL_REF } from "../../../agents/synthetic-models.js";
import { applySyntheticConfig, applySyntheticProviderConfig } from "./config.js";

export const SYNTHETIC_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "synthetic-api-key",
    tokenProviders: ["synthetic"],
    providerId: "synthetic",
    profileId: "synthetic:default",
    label: "Synthetic",
    keyPrompt: "Enter Synthetic API key",
    optionKey: "syntheticApiKey",
    validate: (value) => (value.trim() ? undefined : "Required"),
    defaultModel: {
      kind: "standard",
      defaultModel: SYNTHETIC_DEFAULT_MODEL_REF,
      noteDefault: SYNTHETIC_DEFAULT_MODEL_REF,
      applyDefaultConfig: applySyntheticConfig,
      applyProviderConfig: applySyntheticProviderConfig,
    },
  },
];

export const SYNTHETIC_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "synthetic-api-key",
    providerId: "synthetic",
    profileId: "synthetic:default",
    optionKey: "syntheticApiKey",
    flagName: "--synthetic-api-key",
    envVar: "SYNTHETIC_API_KEY",
    applyConfig: (config) => applySyntheticConfig(config),
  },
];

export const SYNTHETIC_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  synthetic: "synthetic-api-key",
};
