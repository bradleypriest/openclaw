import type { AuthChoice } from "../../../commands/onboard-types.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import { KIMI_CODING_MODEL_REF } from "../../../commands/onboard-auth.models.js";
import { applyKimiCodeConfig, applyKimiCodeProviderConfig } from "./config.js";

export const KIMI_CODING_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "kimi-code-api-key",
    tokenProviders: ["kimi-code", "kimi-coding"],
    providerId: "kimi-coding",
    profileId: "kimi-coding:default",
    label: "Kimi Coding",
    keyPrompt: "Enter Kimi Coding API key",
    optionKey: "kimiCodeApiKey",
    noteBeforePrompt: {
      title: "Kimi Coding",
      message: [
        "Kimi Coding uses a dedicated endpoint and API key.",
        "Get your API key at: https://www.kimi.com/code/en",
      ].join("\n"),
    },
    defaultModel: {
      kind: "standard",
      defaultModel: KIMI_CODING_MODEL_REF,
      noteDefault: KIMI_CODING_MODEL_REF,
      applyDefaultConfig: applyKimiCodeConfig,
      applyProviderConfig: applyKimiCodeProviderConfig,
    },
  },
];

export const KIMI_CODING_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "kimi-code-api-key",
    providerId: "kimi-coding",
    profileId: "kimi-coding:default",
    optionKey: "kimiCodeApiKey",
    flagName: "--kimi-code-api-key",
    envVar: "KIMI_API_KEY",
    applyConfig: (config) => applyKimiCodeConfig(config),
  },
];

export const KIMI_CODING_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  "kimi-code": "kimi-code-api-key",
  "kimi-coding": "kimi-code-api-key",
};
