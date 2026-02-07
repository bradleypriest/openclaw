import type { OpenClawConfig } from "../config/config.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { upsertAuthProfile } from "../agents/auth-profiles.js";
import { resolveEnvApiKey } from "../agents/model-auth.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { enablePluginInConfig } from "../plugins/enable.js";
import {
  findDeclarativeProviderAuthByChoice,
  findDeclarativeProviderAuthByTokenProvider,
} from "../plugins/provider-auth-manifest.js";
import { ensureBuiltinProviderSetupHooksRegistered } from "../providers/builtin/setup-hooks.js";
import { ZAI_PROVIDER_CONFIG_HOOK_ID } from "../providers/builtin/zai/setup.js";
import { applyProviderSetupHook } from "../providers/setup-hooks.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import { applyDefaultModelChoice } from "./auth-choice.default-model.js";
import {
  applyGoogleGeminiModelDefault,
  GOOGLE_GEMINI_DEFAULT_MODEL,
} from "./google-gemini-model-default.js";
import {
  applyAuthProfileConfig,
  applyCloudflareAiGatewayConfig,
  applyCloudflareAiGatewayProviderConfig,
  applyKimiCodeConfig,
  applyKimiCodeProviderConfig,
  applyMoonshotConfig,
  applyMoonshotConfigCn,
  applyMoonshotProviderConfig,
  applyMoonshotProviderConfigCn,
  applyOpencodeZenConfig,
  applyOpencodeZenProviderConfig,
  applyOpenrouterConfig,
  applyOpenrouterProviderConfig,
  applySyntheticConfig,
  applySyntheticProviderConfig,
  applyVeniceConfig,
  applyVeniceProviderConfig,
  applyVercelAiGatewayConfig,
  applyVercelAiGatewayProviderConfig,
  applyXiaomiConfig,
  applyXiaomiProviderConfig,
  applyZaiConfig,
  CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
  KIMI_CODING_MODEL_REF,
  MOONSHOT_DEFAULT_MODEL_REF,
  OPENROUTER_DEFAULT_MODEL_REF,
  SYNTHETIC_DEFAULT_MODEL_REF,
  VENICE_DEFAULT_MODEL_REF,
  VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
  XIAOMI_DEFAULT_MODEL_REF,
  writeApiKeyCredential,
  ZAI_DEFAULT_MODEL_REF,
} from "./onboard-auth.js";
import { OPENCODE_ZEN_DEFAULT_MODEL } from "./opencode-zen-model-default.js";

function applyProviderModelConfig(cfg: OpenClawConfig, modelRef: string): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[modelRef] = {
    ...models[modelRef],
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

function applyDefaultModelConfig(cfg: OpenClawConfig, modelRef: string): OpenClawConfig {
  const next = applyProviderModelConfig(cfg, modelRef);
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
          primary: modelRef,
        },
      },
    },
  };
}

function applyBuiltinSetupHookById(
  hookId: string,
  config: OpenClawConfig,
  context?: BuiltinProviderContext,
): OpenClawConfig {
  ensureBuiltinProviderSetupHooksRegistered();
  return applyProviderSetupHook(hookId, config, context);
}

type BuiltinProviderContext = {
  accountId?: string;
  gatewayId?: string;
};

type BuiltinProviderDefaultModel =
  | {
      kind: "standard";
      defaultModel: string;
      noteDefault?: string;
      applyDefaultConfig: (
        config: OpenClawConfig,
        context?: BuiltinProviderContext,
      ) => OpenClawConfig;
      applyProviderConfig: (
        config: OpenClawConfig,
        context?: BuiltinProviderContext,
      ) => OpenClawConfig;
    }
  | {
      kind: "gemini";
      defaultModel: string;
    };

type BuiltinDeclarativeApiProviderSpec = {
  authChoice: string;
  tokenProviders: string[];
  providerId: string;
  profileId: string;
  label: string;
  keyPrompt: string;
  envProvider?: string;
  resolveOptionApiKey?: (opts: ApplyAuthChoiceParams["opts"]) => string | undefined;
  resolveContext?: (params: ApplyAuthChoiceParams) => Promise<BuiltinProviderContext>;
  noteBeforePrompt?: { title: string; message: string };
  validate?: (value: string) => string | undefined;
  normalizeInput?: boolean;
  defaultModel?: BuiltinProviderDefaultModel;
};

const BUILTIN_DECLARATIVE_API_PROVIDER_SPECS: BuiltinDeclarativeApiProviderSpec[] = [
  {
    authChoice: "openrouter-api-key",
    tokenProviders: ["openrouter"],
    providerId: "openrouter",
    profileId: "openrouter:default",
    label: "OpenRouter",
    keyPrompt: "Enter OpenRouter API key",
    defaultModel: {
      kind: "standard",
      defaultModel: OPENROUTER_DEFAULT_MODEL_REF,
      noteDefault: OPENROUTER_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyOpenrouterConfig,
      applyProviderConfig: applyOpenrouterProviderConfig,
    },
  },
  {
    authChoice: "ai-gateway-api-key",
    tokenProviders: ["vercel-ai-gateway"],
    providerId: "vercel-ai-gateway",
    profileId: "vercel-ai-gateway:default",
    label: "Vercel AI Gateway",
    keyPrompt: "Enter Vercel AI Gateway API key",
    defaultModel: {
      kind: "standard",
      defaultModel: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
      noteDefault: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyVercelAiGatewayConfig,
      applyProviderConfig: applyVercelAiGatewayProviderConfig,
    },
  },
  {
    authChoice: "cloudflare-ai-gateway-api-key",
    tokenProviders: ["cloudflare-ai-gateway"],
    providerId: "cloudflare-ai-gateway",
    profileId: "cloudflare-ai-gateway:default",
    label: "Cloudflare AI Gateway",
    keyPrompt: "Enter Cloudflare AI Gateway API key",
    resolveOptionApiKey: (opts) => opts?.cloudflareAiGatewayApiKey,
    resolveContext: async (params) => {
      let accountId = params.opts?.cloudflareAiGatewayAccountId?.trim() ?? "";
      let gatewayId = params.opts?.cloudflareAiGatewayGatewayId?.trim() ?? "";

      if (!accountId) {
        const value = await params.prompter.text({
          message: "Enter Cloudflare Account ID",
          validate: (val) => (String(val).trim() ? undefined : "Account ID is required"),
        });
        accountId = String(value).trim();
      }
      if (!gatewayId) {
        const value = await params.prompter.text({
          message: "Enter Cloudflare AI Gateway ID",
          validate: (val) => (String(val).trim() ? undefined : "Gateway ID is required"),
        });
        gatewayId = String(value).trim();
      }

      return { accountId, gatewayId };
    },
    defaultModel: {
      kind: "standard",
      defaultModel: CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
      noteDefault: CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF,
      applyDefaultConfig: (config, context) =>
        applyCloudflareAiGatewayConfig(config, {
          accountId: context?.accountId,
          gatewayId: context?.gatewayId,
        }),
      applyProviderConfig: (config, context) =>
        applyCloudflareAiGatewayProviderConfig(config, {
          accountId: context?.accountId,
          gatewayId: context?.gatewayId,
        }),
    },
  },
  {
    authChoice: "moonshot-api-key",
    tokenProviders: ["moonshot"],
    providerId: "moonshot",
    profileId: "moonshot:default",
    label: "Moonshot",
    keyPrompt: "Enter Moonshot API key",
    defaultModel: {
      kind: "standard",
      defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyMoonshotConfig,
      applyProviderConfig: applyMoonshotProviderConfig,
    },
  },
  {
    authChoice: "moonshot-api-key-cn",
    tokenProviders: ["moonshot"],
    providerId: "moonshot",
    profileId: "moonshot:default",
    label: "Moonshot (.cn)",
    keyPrompt: "Enter Moonshot API key (.cn)",
    defaultModel: {
      kind: "standard",
      defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyMoonshotConfigCn,
      applyProviderConfig: applyMoonshotProviderConfigCn,
    },
  },
  {
    authChoice: "kimi-code-api-key",
    tokenProviders: ["kimi-code", "kimi-coding"],
    providerId: "kimi-coding",
    profileId: "kimi-coding:default",
    label: "Kimi Coding",
    keyPrompt: "Enter Kimi Coding API key",
    noteBeforePrompt: {
      title: "Kimi Coding",
      message: [
        "Kimi Coding uses a dedicated endpoint and API key.",
        "Get your API key at: https://www.kimi.com/code/en",
      ].join("\n"),
    },
    defaultModel: {
      kind: "standard",
      defaultModel: KIMI_CODING_MODEL_REF,
      noteDefault: KIMI_CODING_MODEL_REF,
      applyDefaultConfig: applyKimiCodeConfig,
      applyProviderConfig: applyKimiCodeProviderConfig,
    },
  },
  {
    authChoice: "gemini-api-key",
    tokenProviders: ["google"],
    providerId: "google",
    profileId: "google:default",
    label: "Google Gemini",
    keyPrompt: "Enter Gemini API key",
    defaultModel: {
      kind: "gemini",
      defaultModel: GOOGLE_GEMINI_DEFAULT_MODEL,
    },
  },
  {
    authChoice: "zai-api-key",
    tokenProviders: ["zai"],
    providerId: "zai",
    profileId: "zai:default",
    label: "Z.AI",
    keyPrompt: "Enter Z.AI API key",
    defaultModel: {
      kind: "standard",
      defaultModel: ZAI_DEFAULT_MODEL_REF,
      noteDefault: ZAI_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyZaiConfig,
      applyProviderConfig: (config, context) =>
        applyBuiltinSetupHookById(ZAI_PROVIDER_CONFIG_HOOK_ID, config, context),
    },
  },
  {
    authChoice: "xiaomi-api-key",
    tokenProviders: ["xiaomi"],
    providerId: "xiaomi",
    profileId: "xiaomi:default",
    label: "Xiaomi",
    keyPrompt: "Enter Xiaomi API key",
    defaultModel: {
      kind: "standard",
      defaultModel: XIAOMI_DEFAULT_MODEL_REF,
      noteDefault: XIAOMI_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyXiaomiConfig,
      applyProviderConfig: applyXiaomiProviderConfig,
    },
  },
  {
    authChoice: "synthetic-api-key",
    tokenProviders: ["synthetic"],
    providerId: "synthetic",
    profileId: "synthetic:default",
    label: "Synthetic",
    keyPrompt: "Enter Synthetic API key",
    validate: (value) => (value.trim() ? undefined : "Required"),
    defaultModel: {
      kind: "standard",
      defaultModel: SYNTHETIC_DEFAULT_MODEL_REF,
      noteDefault: SYNTHETIC_DEFAULT_MODEL_REF,
      applyDefaultConfig: applySyntheticConfig,
      applyProviderConfig: applySyntheticProviderConfig,
    },
  },
  {
    authChoice: "venice-api-key",
    tokenProviders: ["venice"],
    providerId: "venice",
    profileId: "venice:default",
    label: "Venice AI",
    keyPrompt: "Enter Venice AI API key",
    noteBeforePrompt: {
      title: "Venice AI",
      message: [
        "Venice AI provides privacy-focused inference with uncensored models.",
        "Get your API key at: https://venice.ai/settings/api",
        "Supports 'private' (fully private) and 'anonymized' (proxy) modes.",
      ].join("\n"),
    },
    defaultModel: {
      kind: "standard",
      defaultModel: VENICE_DEFAULT_MODEL_REF,
      noteDefault: VENICE_DEFAULT_MODEL_REF,
      applyDefaultConfig: applyVeniceConfig,
      applyProviderConfig: applyVeniceProviderConfig,
    },
  },
  {
    authChoice: "opencode-zen",
    tokenProviders: ["opencode"],
    providerId: "opencode",
    profileId: "opencode:default",
    label: "OpenCode Zen",
    keyPrompt: "Enter OpenCode Zen API key",
    envProvider: "opencode",
    noteBeforePrompt: {
      title: "OpenCode Zen",
      message: [
        "OpenCode Zen provides access to Claude, GPT, Gemini, and more models.",
        "Get your API key at: https://opencode.ai/auth",
        "OpenCode Zen bills per request. Check your OpenCode dashboard for details.",
      ].join("\n"),
    },
    defaultModel: {
      kind: "standard",
      defaultModel: OPENCODE_ZEN_DEFAULT_MODEL,
      noteDefault: OPENCODE_ZEN_DEFAULT_MODEL,
      applyDefaultConfig: applyOpencodeZenConfig,
      applyProviderConfig: applyOpencodeZenProviderConfig,
    },
  },
];

const BUILTIN_PROVIDER_BY_AUTH_CHOICE = new Map(
  BUILTIN_DECLARATIVE_API_PROVIDER_SPECS.map((spec) => [spec.authChoice, spec]),
);

const BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE = (() => {
  const map = new Map<string, string>();
  for (const spec of BUILTIN_DECLARATIVE_API_PROVIDER_SPECS) {
    for (const tokenProvider of spec.tokenProviders) {
      const normalized = normalizeProviderId(tokenProvider);
      if (!map.has(normalized)) {
        map.set(normalized, spec.authChoice);
      }
    }
  }
  return map;
})();

function normalizeBuiltinApiKeyInput(spec: BuiltinDeclarativeApiProviderSpec, raw: string): string {
  if (spec.normalizeInput === false) {
    return raw.trim();
  }
  return normalizeApiKeyInput(raw);
}

function tokenProviderMatches(
  spec: BuiltinDeclarativeApiProviderSpec,
  tokenProviderRaw?: string,
): boolean {
  const tokenProvider = tokenProviderRaw?.trim();
  if (!tokenProvider) {
    return false;
  }
  const normalized = normalizeProviderId(tokenProvider);
  return spec.tokenProviders.some((candidate) => normalizeProviderId(candidate) === normalized);
}

async function applyDeclarativeApiKeyProvider(params: {
  params: ApplyAuthChoiceParams;
  nextConfig: OpenClawConfig;
  agentModelOverride?: string;
  noteAgentModel: (model: string) => Promise<void>;
  authChoice: string;
}): Promise<{ config: OpenClawConfig; agentModelOverride?: string } | null> {
  const declarative = findDeclarativeProviderAuthByChoice(params.authChoice, {
    config: params.nextConfig,
  });
  if (!declarative || declarative.method !== "api-key") {
    return null;
  }

  const enableResult = enablePluginInConfig(params.nextConfig, declarative.pluginId);
  let nextConfig = enableResult.config;
  if (!enableResult.enabled) {
    await params.params.prompter.note(
      `${declarative.label} plugin is disabled (${enableResult.reason ?? "blocked"}).`,
      declarative.label,
    );
    return { config: nextConfig, agentModelOverride: params.agentModelOverride };
  }

  const tokenProvider = normalizeProviderId(params.params.opts?.tokenProvider ?? "");
  const token = params.params.opts?.token;
  let resolvedKey: string | undefined;
  if (token && tokenProvider && tokenProvider === normalizeProviderId(declarative.providerId)) {
    resolvedKey = normalizeApiKeyInput(token);
  } else {
    const envKey = resolveEnvApiKey(declarative.providerId);
    if (envKey) {
      const useExisting = await params.params.prompter.confirm({
        message: `Use existing API key for ${declarative.label} (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
        initialValue: true,
      });
      if (useExisting) {
        resolvedKey = normalizeApiKeyInput(envKey.apiKey);
      }
    }
  }

  if (!resolvedKey) {
    const key = await params.params.prompter.text({
      message: declarative.keyPrompt,
      validate: validateApiKeyInput,
    });
    resolvedKey = normalizeApiKeyInput(String(key));
  }

  upsertAuthProfile({
    profileId: declarative.profileId,
    credential: {
      type: "api_key",
      provider: declarative.providerId,
      key: resolvedKey,
    },
    agentDir: params.params.agentDir,
  });

  nextConfig = applyAuthProfileConfig(nextConfig, {
    profileId: declarative.profileId,
    provider: declarative.providerId,
    mode: "api_key",
  });
  let agentModelOverride = params.agentModelOverride;

  if (declarative.defaultModel) {
    const defaultModel = declarative.defaultModel;
    const applied = await applyDefaultModelChoice({
      config: nextConfig,
      setDefaultModel: params.params.setDefaultModel,
      defaultModel,
      applyDefaultConfig: (cfg) => applyDefaultModelConfig(cfg, defaultModel),
      applyProviderConfig: (cfg) => applyProviderModelConfig(cfg, defaultModel),
      noteDefault: defaultModel,
      noteAgentModel: params.noteAgentModel,
      prompter: params.params.prompter,
    });
    nextConfig = applied.config;
    agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
  }

  return { config: nextConfig, agentModelOverride };
}

async function applyBuiltinDeclarativeApiProvider(params: {
  params: ApplyAuthChoiceParams;
  nextConfig: OpenClawConfig;
  agentModelOverride?: string;
  noteAgentModel: (model: string) => Promise<void>;
  authChoice: string;
}): Promise<{ config: OpenClawConfig; agentModelOverride?: string } | null> {
  const spec = BUILTIN_PROVIDER_BY_AUTH_CHOICE.get(params.authChoice);
  if (!spec) {
    return null;
  }

  let nextConfig = params.nextConfig;
  let agentModelOverride = params.agentModelOverride;
  let resolvedContext: BuiltinProviderContext | undefined;

  const ensureContext = async (): Promise<BuiltinProviderContext | undefined> => {
    if (!spec.resolveContext) {
      return undefined;
    }
    if (!resolvedContext) {
      resolvedContext = await spec.resolveContext(params.params);
    }
    return resolvedContext;
  };

  const persistCredential = async (rawKey: string): Promise<void> => {
    const context = await ensureContext();
    if (spec.providerId === "cloudflare-ai-gateway") {
      const accountId = context?.accountId?.trim();
      const gatewayId = context?.gatewayId?.trim();
      if (!accountId || !gatewayId) {
        throw new Error("Cloudflare Account ID and Gateway ID are required");
      }
      await writeApiKeyCredential({
        providerId: spec.providerId,
        profileId: spec.profileId,
        key: normalizeBuiltinApiKeyInput(spec, rawKey),
        metadata: { accountId, gatewayId },
        agentDir: params.params.agentDir,
      });
      return;
    }

    await writeApiKeyCredential({
      providerId: spec.providerId,
      profileId: spec.profileId,
      key: normalizeBuiltinApiKeyInput(spec, rawKey),
      agentDir: params.params.agentDir,
    });
  };

  let hasCredential = false;
  const opts = params.params.opts;
  const tokenFromOpts =
    opts?.token && tokenProviderMatches(spec, opts.tokenProvider) ? opts.token : undefined;
  if (tokenFromOpts) {
    await persistCredential(tokenFromOpts);
    hasCredential = true;
  }

  const explicitOptionApiKey = spec.resolveOptionApiKey?.(opts);
  if (!hasCredential && explicitOptionApiKey?.trim()) {
    await persistCredential(explicitOptionApiKey);
    hasCredential = true;
  }

  if (!hasCredential && spec.noteBeforePrompt) {
    await params.params.prompter.note(spec.noteBeforePrompt.message, spec.noteBeforePrompt.title);
  }

  if (!hasCredential) {
    const envKey = resolveEnvApiKey(spec.envProvider ?? spec.providerId);
    if (envKey) {
      const envVarLabel = envKey.source.split(":").pop()?.trim() || "API key";
      const useExisting = await params.params.prompter.confirm({
        message: `Use existing ${envVarLabel} (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
        initialValue: true,
      });
      if (useExisting) {
        await persistCredential(envKey.apiKey);
        hasCredential = true;
      }
    }
  }

  if (!hasCredential) {
    const key = await params.params.prompter.text({
      message: spec.keyPrompt,
      validate: spec.validate ?? validateApiKeyInput,
    });
    await persistCredential(String(key));
  }

  nextConfig = applyAuthProfileConfig(nextConfig, {
    profileId: spec.profileId,
    provider: spec.providerId,
    mode: "api_key",
  });

  if (spec.defaultModel?.kind === "standard") {
    const defaultModelSpec = spec.defaultModel;
    const context = await ensureContext();
    const applied = await applyDefaultModelChoice({
      config: nextConfig,
      setDefaultModel: params.params.setDefaultModel,
      defaultModel: defaultModelSpec.defaultModel,
      applyDefaultConfig: (config) => defaultModelSpec.applyDefaultConfig(config, context),
      applyProviderConfig: (config) => defaultModelSpec.applyProviderConfig(config, context),
      noteDefault: defaultModelSpec.noteDefault,
      noteAgentModel: params.noteAgentModel,
      prompter: params.params.prompter,
    });
    nextConfig = applied.config;
    agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
  } else if (spec.defaultModel?.kind === "gemini") {
    if (params.params.setDefaultModel) {
      const applied = applyGoogleGeminiModelDefault(nextConfig);
      nextConfig = applied.next;
      if (applied.changed) {
        await params.params.prompter.note(
          `Default model set to ${spec.defaultModel.defaultModel}`,
          "Model configured",
        );
      }
    } else {
      agentModelOverride = spec.defaultModel.defaultModel;
      await params.noteAgentModel(spec.defaultModel.defaultModel);
    }
  }

  return { config: nextConfig, agentModelOverride };
}

export async function applyAuthChoiceApiProviders(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  let nextConfig = params.config;
  const noteAgentModel = async (model: string) => {
    if (!params.agentId) {
      return;
    }
    await params.prompter.note(
      `Default model set to ${model} for agent "${params.agentId}".`,
      "Model configured",
    );
  };

  let authChoice = params.authChoice;
  if (authChoice === "apiKey" && params.opts?.tokenProvider) {
    const tokenProvider = normalizeProviderId(params.opts.tokenProvider);
    if (tokenProvider !== "anthropic" && tokenProvider !== "openai") {
      const mappedAuthChoice = BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE.get(tokenProvider);
      if (mappedAuthChoice) {
        authChoice = mappedAuthChoice as typeof authChoice;
      } else {
        const declarative = findDeclarativeProviderAuthByTokenProvider(tokenProvider, {
          config: nextConfig,
        });
        if (declarative) {
          authChoice = declarative.authChoice as typeof authChoice;
        }
      }
    }
  }

  const declarativePluginResult = await applyDeclarativeApiKeyProvider({
    params,
    nextConfig,
    agentModelOverride: undefined,
    noteAgentModel,
    authChoice,
  });
  if (declarativePluginResult) {
    return declarativePluginResult;
  }

  const declarativeBuiltinResult = await applyBuiltinDeclarativeApiProvider({
    params,
    nextConfig,
    agentModelOverride: undefined,
    noteAgentModel,
    authChoice,
  });
  if (declarativeBuiltinResult) {
    return declarativeBuiltinResult;
  }

  return null;
}
