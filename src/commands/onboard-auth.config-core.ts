import type { OpenClawConfig } from "../config/config.js";
import type { ModelApi } from "../config/types.models.js";
import {
  buildCloudflareAiGatewayModelDefinition,
  resolveCloudflareAiGatewayBaseUrl,
} from "../agents/cloudflare-ai-gateway.js";
import {
  buildQianfanProvider,
  buildXiaomiProvider,
  QIANFAN_DEFAULT_MODEL_ID,
  XIAOMI_DEFAULT_MODEL_ID,
} from "../agents/models-config.providers.js";
import {
  buildSyntheticModelDefinition,
  SYNTHETIC_BASE_URL,
  SYNTHETIC_DEFAULT_MODEL_REF,
  SYNTHETIC_MODEL_CATALOG,
} from "../agents/synthetic-models.js";
import {
  buildVeniceModelDefinition,
  VENICE_BASE_URL,
  VENICE_DEFAULT_MODEL_REF,
  VENICE_MODEL_CATALOG,
} from "../agents/venice-models.js";
import { ensureBuiltinProviderSetupHooksRegistered } from "../providers/builtin/setup-hooks.js";
import { ZAI_PROVIDER_CONFIG_HOOK_ID } from "../providers/builtin/zai/setup.js";
import { applyProviderSetupHook } from "../providers/setup-hooks.js";
import {
  CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
  OPENROUTER_DEFAULT_MODEL_REF,
  VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
  XIAOMI_DEFAULT_MODEL_REF,
  ZAI_DEFAULT_MODEL_REF,
  XAI_DEFAULT_MODEL_REF,
} from "./onboard-auth.credentials.js";
import {
  buildMoonshotModelDefinition,
  buildXaiModelDefinition,
  QIANFAN_BASE_URL,
  QIANFAN_DEFAULT_MODEL_REF,
  KIMI_CODING_MODEL_REF,
  MOONSHOT_BASE_URL,
  MOONSHOT_CN_BASE_URL,
  MOONSHOT_DEFAULT_MODEL_ID,
  MOONSHOT_DEFAULT_MODEL_REF,
  XAI_BASE_URL,
  XAI_DEFAULT_MODEL_ID,
} from "./onboard-auth.models.js";

export {
  applyCloudflareAiGatewayConfig,
  applyCloudflareAiGatewayProviderConfig,
} from "../providers/builtin/cloudflare-ai-gateway/config.js";
export {
  applyKimiCodeConfig,
  applyKimiCodeProviderConfig,
} from "../providers/builtin/kimi-coding/config.js";
export {
  applyMoonshotConfig,
  applyMoonshotConfigCn,
  applyMoonshotProviderConfig,
  applyMoonshotProviderConfigCn,
} from "../providers/builtin/moonshot/config.js";
export {
  applyOpenrouterConfig,
  applyOpenrouterProviderConfig,
} from "../providers/builtin/openrouter/config.js";
export {
  applySyntheticConfig,
  applySyntheticProviderConfig,
} from "../providers/builtin/synthetic/config.js";
export {
  applyVeniceConfig,
  applyVeniceProviderConfig,
} from "../providers/builtin/venice/config.js";
export {
  applyVercelAiGatewayConfig,
  applyVercelAiGatewayProviderConfig,
} from "../providers/builtin/vercel-ai-gateway/config.js";
export { applyXaiConfig, applyXaiProviderConfig } from "../providers/builtin/xai/config.js";
export {
  applyXiaomiConfig,
  applyXiaomiProviderConfig,
} from "../providers/builtin/xiaomi/config.js";
export { applyZaiConfig } from "../providers/builtin/zai/config.js";

export function applyAuthProfileConfig(
  cfg: OpenClawConfig,
  params: {
    profileId: string;
    provider: string;
    mode: "api_key" | "oauth" | "token";
    email?: string;
    preferProfileFirst?: boolean;
  },
): OpenClawConfig {
  const profiles = {
    ...cfg.auth?.profiles,
    [params.profileId]: {
      provider: params.provider,
      mode: params.mode,
      ...(params.email ? { email: params.email } : {}),
    },
  };

  const existingProviderOrder = cfg.auth?.order?.[params.provider];
  const preferProfileFirst = params.preferProfileFirst ?? true;
  const reorderedProviderOrder =
    existingProviderOrder && preferProfileFirst
      ? [
          params.profileId,
          ...existingProviderOrder.filter((profileId) => profileId !== params.profileId),
        ]
      : existingProviderOrder;
  const order =
    existingProviderOrder !== undefined
      ? {
          ...cfg.auth?.order,
          [params.provider]: reorderedProviderOrder?.includes(params.profileId)
            ? reorderedProviderOrder
            : [...(reorderedProviderOrder ?? []), params.profileId],
        }
      : cfg.auth?.order;

  return {
    ...cfg,
    auth: {
      ...cfg.auth,
      profiles,
      ...(order ? { order } : {}),
    },
  };
}

export function applyQianfanProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[QIANFAN_DEFAULT_MODEL_REF] = {
    ...models[QIANFAN_DEFAULT_MODEL_REF],
    alias: models[QIANFAN_DEFAULT_MODEL_REF]?.alias ?? "QIANFAN",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.qianfan;
  const defaultProvider = buildQianfanProvider();
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const defaultModels = defaultProvider.models ?? [];
  const hasDefaultModel = existingModels.some((model) => model.id === QIANFAN_DEFAULT_MODEL_ID);
  const mergedModels =
    existingModels.length > 0
      ? hasDefaultModel
        ? existingModels
        : [...existingModels, ...defaultModels]
      : defaultModels;
  const {
    apiKey: existingApiKey,
    baseUrl: existingBaseUrl,
    api: existingApi,
    ...existingProviderRest
  } = (existingProvider ?? {}) as Record<string, unknown> as {
    apiKey?: string;
    baseUrl?: string;
    api?: ModelApi;
  };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.qianfan = {
    ...existingProviderRest,
    baseUrl: existingBaseUrl ?? QIANFAN_BASE_URL,
    api: existingApi ?? "openai-completions",
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
  const next = applyQianfanProviderConfig(cfg);
  const existingModel = next.agents?.defaults?.model;
  return {
    ...next,
    agents: {
      ...next.agents,
      defaults: {
        ...next.agents?.defaults,
        model: {
          ...(existingModel && "fallbacks" in (existingModel as Record<string, unknown>)
            ? {
                fallbacks: (existingModel as { fallbacks?: string[] }).fallbacks,
              }
            : undefined),
          primary: QIANFAN_DEFAULT_MODEL_REF,
        },
      },
    },
  };
}
