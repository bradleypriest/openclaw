import type { OpenClawConfig } from "../../../config/config.js";
import { ZAI_DEFAULT_MODEL_REF } from "../../../commands/onboard-auth.credentials.js";
import { registerProviderSetupHook } from "../../setup-hooks.js";

export const ZAI_PROVIDER_CONFIG_HOOK_ID = "builtin:zai:provider-config";

function applyZaiProviderConfig(config: OpenClawConfig): OpenClawConfig {
  return {
    ...config,
    agents: {
      ...config.agents,
      defaults: {
        ...config.agents?.defaults,
        models: {
          ...config.agents?.defaults?.models,
          [ZAI_DEFAULT_MODEL_REF]: {
            ...config.agents?.defaults?.models?.[ZAI_DEFAULT_MODEL_REF],
            alias: config.agents?.defaults?.models?.[ZAI_DEFAULT_MODEL_REF]?.alias ?? "GLM",
          },
        },
      },
    },
  };
}

export function registerZaiProviderSetupHook(): void {
  registerProviderSetupHook(ZAI_PROVIDER_CONFIG_HOOK_ID, applyZaiProviderConfig);
}
