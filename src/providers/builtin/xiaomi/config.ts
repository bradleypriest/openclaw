import type { OpenClawConfig } from "../../../config/config.js";
import { XIAOMI_DEFAULT_MODEL_REF } from "../../../commands/onboard-auth.credentials.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import { buildXiaomiProvider, XIAOMI_DEFAULT_MODEL_ID } from "../implicit-providers.js";

export function applyXiaomiProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[XIAOMI_DEFAULT_MODEL_REF] = {
    ...models[XIAOMI_DEFAULT_MODEL_REF],
    alias: models[XIAOMI_DEFAULT_MODEL_REF]?.alias ?? "Xiaomi",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.xiaomi;
  const defaultProvider = buildXiaomiProvider();
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const defaultModels = defaultProvider.models ?? [];
  const hasDefaultModel = existingModels.some((model) => model.id === XIAOMI_DEFAULT_MODEL_ID);
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
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.xiaomi = {
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

export function applyXiaomiConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyXiaomiProviderConfig(cfg), XIAOMI_DEFAULT_MODEL_REF);
}
