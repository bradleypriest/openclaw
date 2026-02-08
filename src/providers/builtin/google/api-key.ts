import type { AuthChoice } from "../../../commands/onboard-types.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import {
  applyGoogleGeminiModelDefault,
  GOOGLE_GEMINI_DEFAULT_MODEL,
} from "../../../commands/google-gemini-model-default.js";

export const GOOGLE_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "gemini-api-key",
    tokenProviders: ["google"],
    providerId: "google",
    profileId: "google:default",
    label: "Google Gemini",
    keyPrompt: "Enter Gemini API key",
    optionKey: "geminiApiKey",
    defaultModel: {
      kind: "gemini",
      defaultModel: GOOGLE_GEMINI_DEFAULT_MODEL,
    },
  },
];

export const GOOGLE_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "gemini-api-key",
    providerId: "google",
    profileId: "google:default",
    optionKey: "geminiApiKey",
    flagName: "--gemini-api-key",
    envVar: "GEMINI_API_KEY",
    applyConfig: (config) => applyGoogleGeminiModelDefault(config).next,
  },
];

export const GOOGLE_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  google: "gemini-api-key",
};
