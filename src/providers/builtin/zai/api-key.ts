import type { AuthChoice } from "../../../commands/onboard-types.js";
import type { OpenClawConfig } from "../../../config/config.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
  BuiltinProviderContext,
} from "../api-key/types.js";
import { ZAI_DEFAULT_MODEL_REF } from "../../../commands/onboard-auth.credentials.js";
import { applyProviderSetupHook } from "../../setup-hooks.js";
import { ensureBuiltinProviderSetupHooksRegistered } from "../setup-hooks.js";
import { applyZaiConfig } from "./config.js";
import { ZAI_PROVIDER_CONFIG_HOOK_ID } from "./setup.js";

function applyBuiltinSetupHookById(
  hookId: string,
  config: OpenClawConfig,
  context?: BuiltinProviderContext,
): OpenClawConfig {
  ensureBuiltinProviderSetupHooksRegistered();
  return applyProviderSetupHook(hookId, config, context);
}

export const ZAI_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "zai-api-key",
    tokenProviders: ["zai"],
    providerId: "zai",
    profileId: "zai:default",
    label: "Z.AI",
    keyPrompt: "Enter Z.AI API key",
    optionKey: "zaiApiKey",
    defaultModel: {
      kind: "standard",
      defaultModel: ZAI_DEFAULT_MODEL_REF,
      noteDefault: ZAI_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyZaiConfig,
      applyProviderConfig: (config, context) =>
        applyBuiltinSetupHookById(ZAI_PROVIDER_CONFIG_HOOK_ID, config, context),
    },
  },
];

export const ZAI_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "zai-api-key",
    providerId: "zai",
    profileId: "zai:default",
    optionKey: "zaiApiKey",
    flagName: "--zai-api-key",
    envVar: "ZAI_API_KEY",
    applyConfig: (config) => applyZaiConfig(config),
  },
];

export const ZAI_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  zai: "zai-api-key",
};
