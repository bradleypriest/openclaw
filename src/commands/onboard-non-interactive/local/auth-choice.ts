import type { OpenClawConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { normalizeProviderId } from "../../../agents/model-selection.js";
import { parseDurationMs } from "../../../cli/parse-duration.js";
import { upsertSharedEnvVar } from "../../../infra/env-file.js";
import { enablePluginInConfig } from "../../../plugins/enable.js";
import {
  findDeclarativeProviderAuthByChoice,
  findDeclarativeProviderAuthByTokenProvider,
} from "../../../plugins/provider-auth-manifest.js";
import {
  BUILTIN_NON_INTERACTIVE_API_KEY_BY_AUTH_CHOICE,
  resolveBuiltinApiKeyAuthChoiceByProvider,
} from "../../../providers/builtin/api-key/non-interactive-specs.js";
import { shortenHomePath } from "../../../utils.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "../../auth-token.js";
import {
  applyAuthProfileConfig,
  applyMinimaxConfig,
  writeApiKeyCredential,
} from "../../onboard-auth.js";
import { applyOpenAIConfig } from "../../openai-model-default.js";
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

  if (authChoice === "claude-cli" || authChoice === "codex-cli") {
    runtime.error(
      [
        `Auth choice "${authChoice}" is deprecated.`,
        'Use "--auth-choice token" (Anthropic setup-token) or "--auth-choice openai-codex".',
      ].join("\n"),
    );
    runtime.exit(1);
    return null;
  }

  if (authChoice === "setup-token") {
    runtime.error(
      [
        'Auth choice "setup-token" requires interactive mode.',
        'Use "--auth-choice token" with --token and --provider anthropic.',
      ].join("\n"),
    );
    runtime.exit(1);
    return null;
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

    if (provider && normalizeProviderId(provider) !== "anthropic") {
      runtime.error(
        `Unsupported --provider ${provider} for --auth-choice apiKey. Use --provider <provider-id> or <npm-package>:<provider-id>, or pass an explicit --auth-choice.`,
      );
      runtime.exit(1);
      return null;
    }

    const resolved = await resolveNonInteractiveApiKey({
      provider: "anthropic",
      cfg: baseConfig,
      flagValue: opts.anthropicApiKey,
      flagName: "--anthropic-api-key",
      envVar: "ANTHROPIC_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "anthropic",
        profileId: "anthropic:default",
        key: resolved.key,
      });
    }
    return applyAuthProfileConfig(nextConfig, {
      profileId: "anthropic:default",
      provider: "anthropic",
      mode: "api_key",
    });
  }

  if (authChoice === "token") {
    const providerRaw = opts.provider?.trim();
    if (!providerRaw) {
      runtime.error("Missing --provider for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const provider = normalizeProviderId(providerRaw);
    if (provider !== "anthropic") {
      runtime.error("Only --provider anthropic is supported for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const tokenRaw = opts.token?.trim();
    if (!tokenRaw) {
      runtime.error("Missing --token for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const tokenError = validateAnthropicSetupToken(tokenRaw);
    if (tokenError) {
      runtime.error(tokenError);
      runtime.exit(1);
      return null;
    }

    let expires: number | undefined;
    const expiresInRaw = opts.tokenExpiresIn?.trim();
    if (expiresInRaw) {
      try {
        expires = Date.now() + parseDurationMs(expiresInRaw, { defaultUnit: "d" });
      } catch (err) {
        runtime.error(`Invalid --token-expires-in: ${String(err)}`);
        runtime.exit(1);
        return null;
      }
    }

    const profileId = opts.tokenProfileId?.trim() || buildTokenProfileId({ provider, name: "" });
    upsertAuthProfile({
      profileId,
      credential: {
        type: "token",
        provider,
        token: tokenRaw.trim(),
        ...(expires ? { expires } : {}),
      },
    });
    return applyAuthProfileConfig(nextConfig, {
      profileId,
      provider,
      mode: "token",
    });
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

  if (authChoice === "openai-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "openai",
      cfg: baseConfig,
      flagValue: opts.openaiApiKey,
      flagName: "--openai-api-key",
      envVar: "OPENAI_API_KEY",
      runtime,
      allowProfile: false,
    });
    if (!resolved) {
      return null;
    }
    const key = resolved.key;
    const result = upsertSharedEnvVar({ key: "OPENAI_API_KEY", value: key });
    process.env.OPENAI_API_KEY = key;
    runtime.log(`Saved OPENAI_API_KEY to ${shortenHomePath(result.path)}`);
    return applyOpenAIConfig(nextConfig);
  }

  if (authChoice === "minimax") {
    return applyMinimaxConfig(nextConfig);
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
