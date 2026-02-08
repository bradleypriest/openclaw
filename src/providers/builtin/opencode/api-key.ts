import type { AuthChoice } from "../../../commands/onboard-types.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import { OPENCODE_ZEN_DEFAULT_MODEL } from "../../../commands/opencode-zen-model-default.js";
import { applyOpencodeZenConfig, applyOpencodeZenProviderConfig } from "./config.js";

export const OPENCODE_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "opencode-zen",
    tokenProviders: ["opencode"],
    providerId: "opencode",
    profileId: "opencode:default",
    label: "OpenCode Zen",
    keyPrompt: "Enter OpenCode Zen API key",
    envProvider: "opencode",
    optionKey: "opencodeZenApiKey",
    noteBeforePrompt: {
      title: "OpenCode Zen",
      message: [
        "OpenCode Zen provides access to Claude, GPT, Gemini, and more models.",
        "Get your API key at: https://opencode.ai/auth",
        "OpenCode Zen bills per request. Check your OpenCode dashboard for details.",
      ].join("\n"),
    },
    defaultModel: {
      kind: "standard",
      defaultModel: OPENCODE_ZEN_DEFAULT_MODEL,
      noteDefault: OPENCODE_ZEN_DEFAULT_MODEL,
      applyDefaultConfig: applyOpencodeZenConfig,
      applyProviderConfig: applyOpencodeZenProviderConfig,
    },
  },
];

export const OPENCODE_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "opencode-zen",
    providerId: "opencode",
    profileId: "opencode:default",
    optionKey: "opencodeZenApiKey",
    flagName: "--opencode-zen-api-key",
    envVar: "OPENCODE_API_KEY (or OPENCODE_ZEN_API_KEY)",
    applyConfig: (config) => applyOpencodeZenConfig(config),
  },
];

export const OPENCODE_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  opencode: "opencode-zen",
};
