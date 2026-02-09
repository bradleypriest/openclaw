import type { OpenClawConfig } from "../../../config/config.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import {
  buildQianfanProviderConfig,
  QIANFAN_DEFAULT_MODEL_ID,
  QIANFAN_DEFAULT_MODEL_REF,
} from "./models.js";

export { QIANFAN_DEFAULT_MODEL_REF };

export function applyQianfanProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[QIANFAN_DEFAULT_MODEL_REF] = {
    ...models[QIANFAN_DEFAULT_MODEL_REF],
    alias: models[QIANFAN_DEFAULT_MODEL_REF]?.alias ?? "DEEPSEEK V3.2",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.qianfan;
  const defaultProvider = buildQianfanProviderConfig();
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const defaultModels = defaultProvider.models ?? [];
  const hasDefaultModel = existingModels.some((model) => model.id === QIANFAN_DEFAULT_MODEL_ID);
  const mergedModels =
    existingModels.length > 0
      ? hasDefaultModel
        ? existingModels
        : [...existingModels, ...defaultModels]
      : defaultModels;

  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const normalizedApiKey = typeof existingApiKey === "string" ? existingApiKey.trim() : "";

  providers.qianfan = {
    ...existingProviderRest,
    baseUrl: defaultProvider.baseUrl,
    api: defaultProvider.api,
    ...(normalizedApiKey ? { apiKey: normalizedApiKey } : {}),
    models: mergedModels.length > 0 ? mergedModels : defaultProvider.models,
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
    models: {
      mode: cfg.models?.mode ?? "merge",
      providers,
    },
  };
}

export function applyQianfanConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyQianfanProviderConfig(cfg), QIANFAN_DEFAULT_MODEL_REF);
}
