import type { OpenClawConfig } from "../config/config.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinProviderContext,
} from "../providers/builtin/api-key/types.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { upsertAuthProfile } from "../agents/auth-profiles.js";
import { resolveEnvApiKey } from "../agents/model-auth.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { enablePluginInConfig } from "../plugins/enable.js";
import {
  findDeclarativeProviderAuthByChoice,
  findDeclarativeProviderAuthByTokenProvider,
} from "../plugins/provider-auth-manifest.js";
import {
  BUILTIN_INTERACTIVE_API_KEY_BY_AUTH_CHOICE,
  BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE,
} from "../providers/builtin/api-key/interactive-specs.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import { applyDefaultModelChoice } from "./auth-choice.default-model.js";
import { applyGoogleGeminiModelDefault } from "./google-gemini-model-default.js";
import { applyAuthProfileConfig, writeApiKeyCredential } from "./onboard-auth.js";

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

function normalizeBuiltinApiKeyInput(spec: BuiltinInteractiveApiKeySpec, raw: string): string {
  if (spec.normalizeInput === false) {
    return raw.trim();
  }
  return normalizeApiKeyInput(raw);
}

function tokenProviderMatches(
  spec: BuiltinInteractiveApiKeySpec,
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
  const spec = BUILTIN_INTERACTIVE_API_KEY_BY_AUTH_CHOICE.get(params.authChoice);
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
    await writeApiKeyCredential({
      providerId: spec.providerId,
      profileId: spec.profileId,
      key: normalizeBuiltinApiKeyInput(spec, rawKey),
      metadata: spec.resolveCredentialMetadata?.(context),
      agentDir: params.params.agentDir,
    });
  };

  let hasCredential = false;
  const opts = params.params.opts;
  const optionValues = opts as Record<string, unknown> | undefined;
  const tokenFromOpts =
    opts?.token && tokenProviderMatches(spec, opts.tokenProvider) ? opts.token : undefined;
  if (tokenFromOpts) {
    await persistCredential(tokenFromOpts);
    hasCredential = true;
  }

  const explicitOptionApiKey = spec.optionKey
    ? (optionValues?.[spec.optionKey] as string | undefined)
    : undefined;
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
