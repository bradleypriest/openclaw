import type { OpenClawConfig } from "../../../config/config.js";
import { KIMI_CODING_MODEL_REF } from "../../../commands/onboard-auth.models.js";
import { applyPrimaryDefaultModel } from "../default-model.js";

export function applyKimiCodeProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[KIMI_CODING_MODEL_REF] = {
    ...models[KIMI_CODING_MODEL_REF],
    alias: models[KIMI_CODING_MODEL_REF]?.alias ?? "Kimi K2.5",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyKimiCodeConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyKimiCodeProviderConfig(cfg), KIMI_CODING_MODEL_REF);
}
