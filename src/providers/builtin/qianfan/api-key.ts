import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import {
  applyQianfanConfig,
  applyQianfanProviderConfig,
  QIANFAN_DEFAULT_MODEL_REF,
} from "./config.js";

export const QIANFAN_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "qianfan-api-key",
    tokenProviders: ["qianfan"],
    providerId: "qianfan",
    profileId: "qianfan:default",
    label: "Qianfan",
    keyPrompt: "Enter Qianfan API key",
    optionKey: "qianfanApiKey",
    defaultModel: {
      kind: "standard",
      defaultModel: QIANFAN_DEFAULT_MODEL_REF,
      noteDefault: QIANFAN_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyQianfanConfig,
      applyProviderConfig: applyQianfanProviderConfig,
    },
  },
];

export const QIANFAN_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "qianfan-api-key",
    providerId: "qianfan",
    profileId: "qianfan:default",
    optionKey: "qianfanApiKey",
    flagName: "--qianfan-api-key",
    envVar: "QIANFAN_API_KEY",
    applyConfig: (config) => applyQianfanConfig(config),
  },
];

export const QIANFAN_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  qianfan: "qianfan-api-key",
};
