import type { OpenClawConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { enablePluginInConfig } from "../../../plugins/enable.js";
import {
  findDeclarativeProviderAuthByChoice,
  findDeclarativeProviderAuthByTokenProvider,
} from "../../../plugins/provider-auth-manifest.js";
import { applyAnthropicNonInteractiveAuthChoice } from "../../../providers/builtin/anthropic/non-interactive-auth.js";
import {
  BUILTIN_NON_INTERACTIVE_API_KEY_BY_AUTH_CHOICE,
  resolveBuiltinApiKeyAuthChoiceByProvider,
} from "../../../providers/builtin/api-key/non-interactive-specs.js";
import { applyMiniMaxNonInteractiveAuthChoice } from "../../../providers/builtin/minimax/non-interactive-auth.js";
import { applyOpenAINonInteractiveAuthChoice } from "../../../providers/builtin/openai/non-interactive-auth.js";
import { applyAuthProfileConfig, writeApiKeyCredential } from "../../onboard-auth.js";
import { resolveNonInteractiveApiKey } from "../api-keys.js";

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

function mapProviderToBuiltinApiAuthChoice(providerRaw?: string): AuthChoice | undefined {
  return resolveBuiltinApiKeyAuthChoiceByProvider(providerRaw);
}

async function applyDeclarativeNonInteractiveApiKeyAuth(params: {
  nextConfig: OpenClawConfig;
  baseConfig: OpenClawConfig;
  runtime: RuntimeEnv;
  token?: string;
  pluginId: string;
  providerId: string;
  profileId: string;
  defaultModel?: string;
  envVars: string[];
}): Promise<OpenClawConfig | null> {
  const enableResult = enablePluginInConfig(params.nextConfig, params.pluginId);
  if (!enableResult.enabled) {
    params.runtime.error(
      `Provider plugin "${params.pluginId}" is disabled (${enableResult.reason ?? "blocked"}).`,
    );
    params.runtime.exit(1);
    return null;
  }

  const envVarLabel = params.envVars.join(" or ") || `${params.providerId.toUpperCase()}_API_KEY`;
  const resolved = await resolveNonInteractiveApiKey({
    provider: params.providerId,
    cfg: params.baseConfig,
    flagValue: params.token,
    flagName: "--api-key",
    envVar: envVarLabel,
    runtime: params.runtime,
  });
  if (!resolved) {
    return null;
  }

  if (resolved.source !== "profile") {
    upsertAuthProfile({
      profileId: params.profileId,
      credential: {
        type: "api_key",
        provider: params.providerId,
        key: resolved.key,
      },
    });
  }

  let nextConfig = applyAuthProfileConfig(enableResult.config, {
    profileId: params.profileId,
    provider: params.providerId,
    mode: "api_key",
  });

  if (params.defaultModel) {
    nextConfig = applyDefaultModelConfig(nextConfig, params.defaultModel);
  }

  return nextConfig;
}

async function persistApiKeyProfile(params: {
  providerId: string;
  profileId: string;
  key: string;
  metadata?: Record<string, string | undefined>;
}) {
  await writeApiKeyCredential({
    providerId: params.providerId,
    profileId: params.profileId,
    key: params.key,
    metadata: params.metadata,
  });
}

async function applyBuiltinNonInteractiveApiKeyChoice(params: {
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
  nextConfig: OpenClawConfig;
}): Promise<OpenClawConfig | null | undefined> {
  const spec = BUILTIN_NON_INTERACTIVE_API_KEY_BY_AUTH_CHOICE.get(params.authChoice);
  if (!spec) {
    return undefined;
  }

  const metadata = spec.resolveMetadata?.(params.opts, params.runtime);
  if (metadata === null) {
    return null;
  }

  const optionValue = spec.optionKey
    ? (params.opts[spec.optionKey] as string | undefined)
    : undefined;

  const resolved = await resolveNonInteractiveApiKey({
    provider: spec.providerId,
    cfg: params.baseConfig,
    flagValue: optionValue,
    flagName: spec.flagName,
    envVar: spec.envVar,
    runtime: params.runtime,
  });
  if (!resolved) {
    return null;
  }

  if (resolved.source !== "profile") {
    await persistApiKeyProfile({
      providerId: spec.providerId,
      profileId: spec.profileId,
      key: resolved.key,
      metadata,
    });
  }

  const nextConfig = applyAuthProfileConfig(params.nextConfig, {
    profileId: spec.profileId,
    provider: spec.providerId,
    mode: "api_key",
  });
  return spec.applyConfig(nextConfig, params.authChoice, metadata ?? undefined);
}

export async function applyNonInteractiveAuthChoice(params: {
  nextConfig: OpenClawConfig;
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
}): Promise<OpenClawConfig | null> {
  const { authChoice, opts, runtime, baseConfig } = params;
  let nextConfig = params.nextConfig;

  const appliedAnthropic = await applyAnthropicNonInteractiveAuthChoice({
    authChoice,
    opts,
    runtime,
    baseConfig,
    nextConfig,
  });
  if (appliedAnthropic !== undefined) {
    return appliedAnthropic;
  }

  if (authChoice === "apiKey") {
    const builtinChoice = mapProviderToBuiltinApiAuthChoice(opts.provider);
    if (builtinChoice) {
      return applyNonInteractiveAuthChoice({
        ...params,
        authChoice: builtinChoice,
      });
    }

    const provider = opts.provider?.trim();
    const declarative = provider
      ? findDeclarativeProviderAuthByTokenProvider(provider, {
          config: baseConfig,
        })
      : undefined;
    if (declarative?.method === "api-key") {
      return applyDeclarativeNonInteractiveApiKeyAuth({
        nextConfig,
        baseConfig,
        runtime,
        token: opts.token,
        pluginId: declarative.pluginId,
        providerId: declarative.providerId,
        profileId: declarative.profileId,
        defaultModel: declarative.defaultModel,
        envVars: declarative.envVars,
      });
    }

    if (provider) {
      runtime.error(
        `Unsupported --provider ${provider} for --auth-choice apiKey. Use --provider <provider-id> or <npm-package>:<provider-id>, or pass an explicit --auth-choice.`,
      );
      runtime.exit(1);
      return null;
    }
  }

  const appliedBuiltin = await applyBuiltinNonInteractiveApiKeyChoice({
    authChoice,
    opts,
    runtime,
    baseConfig,
    nextConfig,
  });
  if (appliedBuiltin !== undefined) {
    return appliedBuiltin;
  }

  const appliedOpenAI = await applyOpenAINonInteractiveAuthChoice({
    authChoice,
    opts,
    runtime,
    baseConfig,
    nextConfig,
  });
  if (appliedOpenAI !== undefined) {
    return appliedOpenAI;
  }

  const appliedMinimax = applyMiniMaxNonInteractiveAuthChoice({
    authChoice,
    nextConfig,
  });
  if (appliedMinimax !== undefined) {
    return appliedMinimax;
  }

  const declarativeChoice = findDeclarativeProviderAuthByChoice(authChoice, {
    config: baseConfig,
  });
  if (declarativeChoice?.method === "api-key") {
    return applyDeclarativeNonInteractiveApiKeyAuth({
      nextConfig,
      baseConfig,
      runtime,
      token: opts.token,
      pluginId: declarativeChoice.pluginId,
      providerId: declarativeChoice.providerId,
      profileId: declarativeChoice.profileId,
      defaultModel: declarativeChoice.defaultModel,
      envVars: declarativeChoice.envVars,
    });
  }

  if (
    authChoice === "oauth" ||
    authChoice === "chutes" ||
    authChoice === "openai-codex" ||
    authChoice === "qwen-portal" ||
    authChoice === "minimax-portal"
  ) {
    runtime.error("OAuth requires interactive mode.");
    runtime.exit(1);
    return null;
  }

  return nextConfig;
}
