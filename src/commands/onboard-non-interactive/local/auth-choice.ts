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

  if (authChoice === "gemini-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "google",
      cfg: baseConfig,
      flagValue: opts.geminiApiKey,
      flagName: "--gemini-api-key",
      envVar: "GEMINI_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "google",
        profileId: "google:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "google:default",
      provider: "google",
      mode: "api_key",
    });
    return applyGoogleGeminiModelDefault(nextConfig).next;
  }

  if (authChoice === "zai-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "zai",
      cfg: baseConfig,
      flagValue: opts.zaiApiKey,
      flagName: "--zai-api-key",
      envVar: "ZAI_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "zai",
        profileId: "zai:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "zai:default",
      provider: "zai",
      mode: "api_key",
    });
    return applyZaiConfig(nextConfig);
  }

  if (authChoice === "xiaomi-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "xiaomi",
      cfg: baseConfig,
      flagValue: opts.xiaomiApiKey,
      flagName: "--xiaomi-api-key",
      envVar: "XIAOMI_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "xiaomi",
        profileId: "xiaomi:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "xiaomi:default",
      provider: "xiaomi",
      mode: "api_key",
    });
    return applyXiaomiConfig(nextConfig);
  }

  if (authChoice === "xai-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "xai",
      cfg: baseConfig,
      flagValue: opts.xaiApiKey,
      flagName: "--xai-api-key",
      envVar: "XAI_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "xai",
        profileId: "xai:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "xai:default",
      provider: "xai",
      mode: "api_key",
    });
    return applyXaiConfig(nextConfig);
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

  if (authChoice === "openrouter-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "openrouter",
      cfg: baseConfig,
      flagValue: opts.openrouterApiKey,
      flagName: "--openrouter-api-key",
      envVar: "OPENROUTER_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "openrouter",
        profileId: "openrouter:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "openrouter:default",
      provider: "openrouter",
      mode: "api_key",
    });
    return applyOpenrouterConfig(nextConfig);
  }

  if (authChoice === "ai-gateway-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "vercel-ai-gateway",
      cfg: baseConfig,
      flagValue: opts.aiGatewayApiKey,
      flagName: "--ai-gateway-api-key",
      envVar: "AI_GATEWAY_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "vercel-ai-gateway",
        profileId: "vercel-ai-gateway:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "vercel-ai-gateway:default",
      provider: "vercel-ai-gateway",
      mode: "api_key",
    });
    return applyVercelAiGatewayConfig(nextConfig);
  }

  if (authChoice === "cloudflare-ai-gateway-api-key") {
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
    const resolved = await resolveNonInteractiveApiKey({
      provider: "cloudflare-ai-gateway",
      cfg: baseConfig,
      flagValue: opts.cloudflareAiGatewayApiKey,
      flagName: "--cloudflare-ai-gateway-api-key",
      envVar: "CLOUDFLARE_AI_GATEWAY_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "cloudflare-ai-gateway",
        profileId: "cloudflare-ai-gateway:default",
        key: resolved.key,
        metadata: { accountId, gatewayId },
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "cloudflare-ai-gateway:default",
      provider: "cloudflare-ai-gateway",
      mode: "api_key",
    });
    return applyCloudflareAiGatewayConfig(nextConfig, {
      accountId,
      gatewayId,
    });
  }

  if (authChoice === "moonshot-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "moonshot",
      cfg: baseConfig,
      flagValue: opts.moonshotApiKey,
      flagName: "--moonshot-api-key",
      envVar: "MOONSHOT_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "moonshot",
        profileId: "moonshot:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "moonshot:default",
      provider: "moonshot",
      mode: "api_key",
    });
    return applyMoonshotConfig(nextConfig);
  }

  if (authChoice === "moonshot-api-key-cn") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "moonshot",
      cfg: baseConfig,
      flagValue: opts.moonshotApiKey,
      flagName: "--moonshot-api-key",
      envVar: "MOONSHOT_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "moonshot",
        profileId: "moonshot:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "moonshot:default",
      provider: "moonshot",
      mode: "api_key",
    });
    return applyMoonshotConfigCn(nextConfig);
  }

  if (authChoice === "kimi-code-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "kimi-coding",
      cfg: baseConfig,
      flagValue: opts.kimiCodeApiKey,
      flagName: "--kimi-code-api-key",
      envVar: "KIMI_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "kimi-coding",
        profileId: "kimi-coding:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "kimi-coding:default",
      provider: "kimi-coding",
      mode: "api_key",
    });
    return applyKimiCodeConfig(nextConfig);
  }

  if (authChoice === "synthetic-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "synthetic",
      cfg: baseConfig,
      flagValue: opts.syntheticApiKey,
      flagName: "--synthetic-api-key",
      envVar: "SYNTHETIC_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "synthetic",
        profileId: "synthetic:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "synthetic:default",
      provider: "synthetic",
      mode: "api_key",
    });
    return applySyntheticConfig(nextConfig);
  }

  if (authChoice === "venice-api-key") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "venice",
      cfg: baseConfig,
      flagValue: opts.veniceApiKey,
      flagName: "--venice-api-key",
      envVar: "VENICE_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "venice",
        profileId: "venice:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "venice:default",
      provider: "venice",
      mode: "api_key",
    });
    return applyVeniceConfig(nextConfig);
  }

  if (
    authChoice === "minimax-cloud" ||
    authChoice === "minimax-api" ||
    authChoice === "minimax-api-lightning"
  ) {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "minimax",
      cfg: baseConfig,
      flagValue: opts.minimaxApiKey,
      flagName: "--minimax-api-key",
      envVar: "MINIMAX_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "minimax",
        profileId: "minimax:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "minimax:default",
      provider: "minimax",
      mode: "api_key",
    });
    const modelId =
      authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
    return applyMinimaxApiConfig(nextConfig, modelId);
  }

  if (authChoice === "minimax") {
    return applyMinimaxConfig(nextConfig);
  }

  if (authChoice === "opencode-zen") {
    const resolved = await resolveNonInteractiveApiKey({
      provider: "opencode",
      cfg: baseConfig,
      flagValue: opts.opencodeZenApiKey,
      flagName: "--opencode-zen-api-key",
      envVar: "OPENCODE_API_KEY (or OPENCODE_ZEN_API_KEY)",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await persistApiKeyProfile({
        providerId: "opencode",
        profileId: "opencode:default",
        key: resolved.key,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "opencode:default",
      provider: "opencode",
      mode: "api_key",
    });
    return applyOpencodeZenConfig(nextConfig);
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
