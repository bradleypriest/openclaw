import type { OpenClawConfig } from "../../../config/config.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import { OPENCODE_ZEN_DEFAULT_MODEL_REF } from "./models.js";

export function applyOpencodeZenProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[OPENCODE_ZEN_DEFAULT_MODEL_REF] = {
    ...models[OPENCODE_ZEN_DEFAULT_MODEL_REF],
    alias: models[OPENCODE_ZEN_DEFAULT_MODEL_REF]?.alias ?? "Opus",
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

export function applyOpencodeZenConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(
    applyOpencodeZenProviderConfig(cfg),
    OPENCODE_ZEN_DEFAULT_MODEL_REF,
  );
}
