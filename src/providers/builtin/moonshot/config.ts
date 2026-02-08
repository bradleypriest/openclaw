import type { OpenClawConfig } from "../../../config/config.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import {
  buildMoonshotModelDefinition,
  MOONSHOT_BASE_URL,
  MOONSHOT_CN_BASE_URL,
  MOONSHOT_DEFAULT_MODEL_ID,
  MOONSHOT_DEFAULT_MODEL_REF,
} from "./models.js";

export function applyMoonshotProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_BASE_URL);
}

export function applyMoonshotProviderConfigCn(cfg: OpenClawConfig): OpenClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_CN_BASE_URL);
}

function applyMoonshotProviderConfigWithBaseUrl(
  cfg: OpenClawConfig,
  baseUrl: string,
): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[MOONSHOT_DEFAULT_MODEL_REF] = {
    ...models[MOONSHOT_DEFAULT_MODEL_REF],
    alias: models[MOONSHOT_DEFAULT_MODEL_REF]?.alias ?? "Kimi",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.moonshot;
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const defaultModel = buildMoonshotModelDefinition();
  const hasDefaultModel = existingModels.some((model) => model.id === MOONSHOT_DEFAULT_MODEL_ID);
  const mergedModels = hasDefaultModel ? existingModels : [...existingModels, defaultModel];
  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.moonshot = {
    ...existingProviderRest,
    baseUrl,
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

export function applyMoonshotConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyMoonshotProviderConfig(cfg), MOONSHOT_DEFAULT_MODEL_REF);
}

export function applyMoonshotConfigCn(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyMoonshotProviderConfigCn(cfg), MOONSHOT_DEFAULT_MODEL_REF);
}
