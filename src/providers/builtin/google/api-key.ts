import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import { applyGoogleConfig, applyGoogleProviderConfig } from "./config.js";
import { GOOGLE_GEMINI_DEFAULT_MODEL } from "./models.js";

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
      kind: "standard",
      defaultModel: GOOGLE_GEMINI_DEFAULT_MODEL,
      noteDefault: GOOGLE_GEMINI_DEFAULT_MODEL,
      applyDefaultConfig: applyGoogleConfig,
      applyProviderConfig: applyGoogleProviderConfig,
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
    applyConfig: (config) => applyGoogleConfig(config),
  },
];

export const GOOGLE_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  google: "gemini-api-key",
};
