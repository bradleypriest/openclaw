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
import { shortenHomePath } from "../../../utils.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "../../auth-token.js";
import { applyGoogleGeminiModelDefault } from "../../google-gemini-model-default.js";
import {
  applyAuthProfileConfig,
  applyCloudflareAiGatewayConfig,
  applyKimiCodeConfig,
  applyMinimaxApiConfig,
  applyMinimaxConfig,
  applyMoonshotConfig,
  applyMoonshotConfigCn,
  applyOpencodeZenConfig,
  applyOpenrouterConfig,
  applySyntheticConfig,
  applyVeniceConfig,
  applyVercelAiGatewayConfig,
  applyXaiConfig,
  applyXiaomiConfig,
  applyZaiConfig,
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
  const providerInput = providerRaw?.trim();
  if (!providerInput) {
    return undefined;
  }

  const provider = normalizeProviderId(providerInput);
  if (provider === "openai") {
    return "openai-api-key";
  }
  if (provider === "openrouter") {
    return "openrouter-api-key";
  }
  if (provider === "vercel-ai-gateway") {
    return "ai-gateway-api-key";
  }
  if (provider === "cloudflare-ai-gateway") {
    return "cloudflare-ai-gateway-api-key";
  }
  if (provider === "moonshot") {
    return "moonshot-api-key";
  }
  if (provider === "kimi-code" || provider === "kimi-coding") {
    return "kimi-code-api-key";
  }
  if (provider === "google") {
    return "gemini-api-key";
  }
  if (provider === "zai") {
    return "zai-api-key";
  }
  if (provider === "xiaomi") {
    return "xiaomi-api-key";
  }
  if (provider === "xai") {
    return "xai-api-key";
  }
  if (provider === "synthetic") {
    return "synthetic-api-key";
  }
  if (provider === "venice") {
    return "venice-api-key";
  }
  if (provider === "opencode") {
    return "opencode-zen";
  }
  if (provider === "minimax") {
    return "minimax-api";
  }

  return undefined;
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

type BuiltinApiKeyAuthChoiceSpec = {
  providerId: string;
  profileId: string;
  flagValue: (opts: OnboardOptions) => string | undefined;
  flagName: string;
  envVar: string;
  applyConfig: (
    config: OpenClawConfig,
    authChoice: AuthChoice,
    metadata?: Record<string, string>,
  ) => OpenClawConfig;
  resolveMetadata?: (opts: OnboardOptions, runtime: RuntimeEnv) => Record<string, string> | null;
};

const BUILTIN_API_KEY_AUTH_CHOICE_SPECS: Partial<Record<AuthChoice, BuiltinApiKeyAuthChoiceSpec>> =
  {
    "gemini-api-key": {
      providerId: "google",
      profileId: "google:default",
      flagValue: (opts) => opts.geminiApiKey,
      flagName: "--gemini-api-key",
      envVar: "GEMINI_API_KEY",
      applyConfig: (config) => applyGoogleGeminiModelDefault(config).next,
    },
    "zai-api-key": {
      providerId: "zai",
      profileId: "zai:default",
      flagValue: (opts) => opts.zaiApiKey,
      flagName: "--zai-api-key",
      envVar: "ZAI_API_KEY",
      applyConfig: (config) => applyZaiConfig(config),
    },
    "xiaomi-api-key": {
      providerId: "xiaomi",
      profileId: "xiaomi:default",
      flagValue: (opts) => opts.xiaomiApiKey,
      flagName: "--xiaomi-api-key",
      envVar: "XIAOMI_API_KEY",
      applyConfig: (config) => applyXiaomiConfig(config),
    },
    "xai-api-key": {
      providerId: "xai",
      profileId: "xai:default",
      flagValue: (opts) => opts.xaiApiKey,
      flagName: "--xai-api-key",
      envVar: "XAI_API_KEY",
      applyConfig: (config) => applyXaiConfig(config),
    },
    "openrouter-api-key": {
      providerId: "openrouter",
      profileId: "openrouter:default",
      flagValue: (opts) => opts.openrouterApiKey,
      flagName: "--openrouter-api-key",
      envVar: "OPENROUTER_API_KEY",
      applyConfig: (config) => applyOpenrouterConfig(config),
    },
    "ai-gateway-api-key": {
      providerId: "vercel-ai-gateway",
      profileId: "vercel-ai-gateway:default",
      flagValue: (opts) => opts.aiGatewayApiKey,
      flagName: "--ai-gateway-api-key",
      envVar: "AI_GATEWAY_API_KEY",
      applyConfig: (config) => applyVercelAiGatewayConfig(config),
    },
    "cloudflare-ai-gateway-api-key": {
      providerId: "cloudflare-ai-gateway",
      profileId: "cloudflare-ai-gateway:default",
      flagValue: (opts) => opts.cloudflareAiGatewayApiKey,
      flagName: "--cloudflare-ai-gateway-api-key",
      envVar: "CLOUDFLARE_AI_GATEWAY_API_KEY",
      applyConfig: (config, _authChoice, metadata) =>
        applyCloudflareAiGatewayConfig(config, {
          accountId: metadata?.accountId,
          gatewayId: metadata?.gatewayId,
        }),
      resolveMetadata: (opts, runtime) => {
        const accountId = opts.cloudflareAiGatewayAccountId?.trim() ?? "";
        const gatewayId = opts.cloudflareAiGatewayGatewayId?.trim() ?? "";
        if (!accountId || !gatewayId) {
          runtime.error(
            [
              'Auth choice "cloudflare-ai-gateway-api-key" requires Account ID and Gateway ID.',
              "Use --cloudflare-ai-gateway-account-id and --cloudflare-ai-gateway-gateway-id.",
            ].join("\n"),
          );
          runtime.exit(1);
          return null;
        }
        return { accountId, gatewayId };
      },
    },
    "moonshot-api-key": {
      providerId: "moonshot",
      profileId: "moonshot:default",
      flagValue: (opts) => opts.moonshotApiKey,
      flagName: "--moonshot-api-key",
      envVar: "MOONSHOT_API_KEY",
      applyConfig: (config) => applyMoonshotConfig(config),
    },
    "moonshot-api-key-cn": {
      providerId: "moonshot",
      profileId: "moonshot:default",
      flagValue: (opts) => opts.moonshotApiKey,
      flagName: "--moonshot-api-key",
      envVar: "MOONSHOT_API_KEY",
      applyConfig: (config) => applyMoonshotConfigCn(config),
    },
    "kimi-code-api-key": {
      providerId: "kimi-coding",
      profileId: "kimi-coding:default",
      flagValue: (opts) => opts.kimiCodeApiKey,
      flagName: "--kimi-code-api-key",
      envVar: "KIMI_API_KEY",
      applyConfig: (config) => applyKimiCodeConfig(config),
    },
    "synthetic-api-key": {
      providerId: "synthetic",
      profileId: "synthetic:default",
      flagValue: (opts) => opts.syntheticApiKey,
      flagName: "--synthetic-api-key",
      envVar: "SYNTHETIC_API_KEY",
      applyConfig: (config) => applySyntheticConfig(config),
    },
    "venice-api-key": {
      providerId: "venice",
      profileId: "venice:default",
      flagValue: (opts) => opts.veniceApiKey,
      flagName: "--venice-api-key",
      envVar: "VENICE_API_KEY",
      applyConfig: (config) => applyVeniceConfig(config),
    },
    "minimax-cloud": {
      providerId: "minimax",
      profileId: "minimax:default",
      flagValue: (opts) => opts.minimaxApiKey,
      flagName: "--minimax-api-key",
      envVar: "MINIMAX_API_KEY",
      applyConfig: (config, authChoice) => {
        const modelId =
          authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
        return applyMinimaxApiConfig(config, modelId);
      },
    },
    "minimax-api": {
      providerId: "minimax",
      profileId: "minimax:default",
      flagValue: (opts) => opts.minimaxApiKey,
      flagName: "--minimax-api-key",
      envVar: "MINIMAX_API_KEY",
      applyConfig: (config, authChoice) => {
        const modelId =
          authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
        return applyMinimaxApiConfig(config, modelId);
      },
    },
    "minimax-api-lightning": {
      providerId: "minimax",
      profileId: "minimax:default",
      flagValue: (opts) => opts.minimaxApiKey,
      flagName: "--minimax-api-key",
      envVar: "MINIMAX_API_KEY",
      applyConfig: (config, authChoice) => {
        const modelId =
          authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
        return applyMinimaxApiConfig(config, modelId);
      },
    },
    "opencode-zen": {
      providerId: "opencode",
      profileId: "opencode:default",
      flagValue: (opts) => opts.opencodeZenApiKey,
      flagName: "--opencode-zen-api-key",
      envVar: "OPENCODE_API_KEY (or OPENCODE_ZEN_API_KEY)",
      applyConfig: (config) => applyOpencodeZenConfig(config),
    },
  };

async function applyBuiltinNonInteractiveApiKeyChoice(params: {
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
  nextConfig: OpenClawConfig;
}): Promise<OpenClawConfig | null | undefined> {
  const spec = BUILTIN_API_KEY_AUTH_CHOICE_SPECS[params.authChoice];
  if (!spec) {
    return undefined;
  }

  const metadata = spec.resolveMetadata?.(params.opts, params.runtime);
  if (metadata === null) {
    return null;
  }

  const resolved = await resolveNonInteractiveApiKey({
    provider: spec.providerId,
    cfg: params.baseConfig,
    flagValue: spec.flagValue(params.opts),
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
