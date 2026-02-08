import type { AuthChoice } from "../../../commands/onboard-types.js";
import type { BuiltinNonInteractiveApiKeySpec } from "./types.js";
import { normalizeProviderId } from "../../../agents/model-selection.js";
import { applyGoogleGeminiModelDefault } from "../../../commands/google-gemini-model-default.js";
import {
  applyCloudflareAiGatewayConfig,
  applyKimiCodeConfig,
  applyMinimaxApiConfig,
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
} from "../../../commands/onboard-auth.js";

export const BUILTIN_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "gemini-api-key",
    providerId: "google",
    profileId: "google:default",
    optionKey: "geminiApiKey",
    flagName: "--gemini-api-key",
    envVar: "GEMINI_API_KEY",
    applyConfig: (config) => applyGoogleGeminiModelDefault(config).next,
  },
  {
    authChoice: "zai-api-key",
    providerId: "zai",
    profileId: "zai:default",
    optionKey: "zaiApiKey",
    flagName: "--zai-api-key",
    envVar: "ZAI_API_KEY",
    applyConfig: (config) => applyZaiConfig(config),
  },
  {
    authChoice: "xiaomi-api-key",
    providerId: "xiaomi",
    profileId: "xiaomi:default",
    optionKey: "xiaomiApiKey",
    flagName: "--xiaomi-api-key",
    envVar: "XIAOMI_API_KEY",
    applyConfig: (config) => applyXiaomiConfig(config),
  },
  {
    authChoice: "xai-api-key",
    providerId: "xai",
    profileId: "xai:default",
    optionKey: "xaiApiKey",
    flagName: "--xai-api-key",
    envVar: "XAI_API_KEY",
    applyConfig: (config) => applyXaiConfig(config),
  },
  {
    authChoice: "openrouter-api-key",
    providerId: "openrouter",
    profileId: "openrouter:default",
    optionKey: "openrouterApiKey",
    flagName: "--openrouter-api-key",
    envVar: "OPENROUTER_API_KEY",
    applyConfig: (config) => applyOpenrouterConfig(config),
  },
  {
    authChoice: "ai-gateway-api-key",
    providerId: "vercel-ai-gateway",
    profileId: "vercel-ai-gateway:default",
    optionKey: "aiGatewayApiKey",
    flagName: "--ai-gateway-api-key",
    envVar: "AI_GATEWAY_API_KEY",
    applyConfig: (config) => applyVercelAiGatewayConfig(config),
  },
  {
    authChoice: "cloudflare-ai-gateway-api-key",
    providerId: "cloudflare-ai-gateway",
    profileId: "cloudflare-ai-gateway:default",
    optionKey: "cloudflareAiGatewayApiKey",
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
  {
    authChoice: "moonshot-api-key",
    providerId: "moonshot",
    profileId: "moonshot:default",
    optionKey: "moonshotApiKey",
    flagName: "--moonshot-api-key",
    envVar: "MOONSHOT_API_KEY",
    applyConfig: (config) => applyMoonshotConfig(config),
  },
  {
    authChoice: "moonshot-api-key-cn",
    providerId: "moonshot",
    profileId: "moonshot:default",
    optionKey: "moonshotApiKey",
    flagName: "--moonshot-api-key",
    envVar: "MOONSHOT_API_KEY",
    applyConfig: (config) => applyMoonshotConfigCn(config),
  },
  {
    authChoice: "kimi-code-api-key",
    providerId: "kimi-coding",
    profileId: "kimi-coding:default",
    optionKey: "kimiCodeApiKey",
    flagName: "--kimi-code-api-key",
    envVar: "KIMI_API_KEY",
    applyConfig: (config) => applyKimiCodeConfig(config),
  },
  {
    authChoice: "synthetic-api-key",
    providerId: "synthetic",
    profileId: "synthetic:default",
    optionKey: "syntheticApiKey",
    flagName: "--synthetic-api-key",
    envVar: "SYNTHETIC_API_KEY",
    applyConfig: (config) => applySyntheticConfig(config),
  },
  {
    authChoice: "venice-api-key",
    providerId: "venice",
    profileId: "venice:default",
    optionKey: "veniceApiKey",
    flagName: "--venice-api-key",
    envVar: "VENICE_API_KEY",
    applyConfig: (config) => applyVeniceConfig(config),
  },
  {
    authChoice: "minimax-cloud",
    providerId: "minimax",
    profileId: "minimax:default",
    optionKey: "minimaxApiKey",
    flagName: "--minimax-api-key",
    envVar: "MINIMAX_API_KEY",
    applyConfig: (config, authChoice) => {
      const modelId =
        authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
      return applyMinimaxApiConfig(config, modelId);
    },
  },
  {
    authChoice: "minimax-api",
    providerId: "minimax",
    profileId: "minimax:default",
    optionKey: "minimaxApiKey",
    flagName: "--minimax-api-key",
    envVar: "MINIMAX_API_KEY",
    applyConfig: (config, authChoice) => {
      const modelId =
        authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
      return applyMinimaxApiConfig(config, modelId);
    },
  },
  {
    authChoice: "minimax-api-lightning",
    providerId: "minimax",
    profileId: "minimax:default",
    optionKey: "minimaxApiKey",
    flagName: "--minimax-api-key",
    envVar: "MINIMAX_API_KEY",
    applyConfig: (config, authChoice) => {
      const modelId =
        authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
      return applyMinimaxApiConfig(config, modelId);
    },
  },
  {
    authChoice: "opencode-zen",
    providerId: "opencode",
    profileId: "opencode:default",
    optionKey: "opencodeZenApiKey",
    flagName: "--opencode-zen-api-key",
    envVar: "OPENCODE_API_KEY (or OPENCODE_ZEN_API_KEY)",
    applyConfig: (config) => applyOpencodeZenConfig(config),
  },
];

export const BUILTIN_NON_INTERACTIVE_API_KEY_BY_AUTH_CHOICE = new Map(
  BUILTIN_NON_INTERACTIVE_API_KEY_SPECS.map((spec) => [spec.authChoice, spec]),
);

const BUILTIN_API_KEY_PROVIDER_TO_CHOICE: Record<string, AuthChoice> = {
  openai: "openai-api-key",
  openrouter: "openrouter-api-key",
  "vercel-ai-gateway": "ai-gateway-api-key",
  "cloudflare-ai-gateway": "cloudflare-ai-gateway-api-key",
  moonshot: "moonshot-api-key",
  "kimi-code": "kimi-code-api-key",
  "kimi-coding": "kimi-code-api-key",
  google: "gemini-api-key",
  zai: "zai-api-key",
  xiaomi: "xiaomi-api-key",
  xai: "xai-api-key",
  synthetic: "synthetic-api-key",
  venice: "venice-api-key",
  opencode: "opencode-zen",
  minimax: "minimax-api",
};

export function resolveBuiltinApiKeyAuthChoiceByProvider(
  providerRaw?: string,
): AuthChoice | undefined {
  const providerInput = providerRaw?.trim();
  if (!providerInput) {
    return undefined;
  }
  const normalized = normalizeProviderId(providerInput);
  return BUILTIN_API_KEY_PROVIDER_TO_CHOICE[normalized];
}
