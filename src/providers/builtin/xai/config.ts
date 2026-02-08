import type { OpenClawConfig } from "../../../config/config.js";
import { XAI_DEFAULT_MODEL_REF } from "../../../commands/onboard-auth.credentials.js";
import {
  buildXaiModelDefinition,
  XAI_BASE_URL,
  XAI_DEFAULT_MODEL_ID,
} from "../../../commands/onboard-auth.models.js";
import { applyPrimaryDefaultModel } from "../default-model.js";

export function applyXaiProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[XAI_DEFAULT_MODEL_REF] = {
    ...models[XAI_DEFAULT_MODEL_REF],
    alias: models[XAI_DEFAULT_MODEL_REF]?.alias ?? "Grok",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.xai;
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const defaultModel = buildXaiModelDefinition();
  const hasDefaultModel = existingModels.some((model) => model.id === XAI_DEFAULT_MODEL_ID);
  const mergedModels = hasDefaultModel ? existingModels : [...existingModels, defaultModel];
  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.xai = {
    ...existingProviderRest,
    baseUrl: XAI_BASE_URL,
    api: "openai-completions",
    ...(normalizedApiKey ? { apiKey: normalizedApiKey } : {}),
    models: mergedModels.length > 0 ? mergedModels : [defaultModel],
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

export function applyXaiConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyXaiProviderConfig(cfg), XAI_DEFAULT_MODEL_REF);
}
