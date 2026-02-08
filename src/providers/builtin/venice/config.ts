import type { OpenClawConfig } from "../../../config/config.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import {
  buildVeniceModelDefinition,
  VENICE_BASE_URL,
  VENICE_DEFAULT_MODEL_REF,
  VENICE_MODEL_CATALOG,
} from "./models.js";

export function applyVeniceProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[VENICE_DEFAULT_MODEL_REF] = {
    ...models[VENICE_DEFAULT_MODEL_REF],
    alias: models[VENICE_DEFAULT_MODEL_REF]?.alias ?? "Llama 3.3 70B",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.venice;
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const veniceModels = VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition);
  const mergedModels = [
    ...existingModels,
    ...veniceModels.filter((model) => !existingModels.some((existing) => existing.id === model.id)),
  ];
  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.venice = {
    ...existingProviderRest,
    baseUrl: VENICE_BASE_URL,
    api: "openai-completions",
    ...(normalizedApiKey ? { apiKey: normalizedApiKey } : {}),
    models: mergedModels.length > 0 ? mergedModels : veniceModels,
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

export function applyVeniceConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyVeniceProviderConfig(cfg), VENICE_DEFAULT_MODEL_REF);
}
