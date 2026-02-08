import type { OpenClawConfig } from "../../../config/config.js";
import type { BuiltinInteractiveApiKeySpec, BuiltinProviderContext } from "./types.js";
import { normalizeProviderId } from "../../../agents/model-selection.js";
import { GOOGLE_GEMINI_DEFAULT_MODEL } from "../../../commands/google-gemini-model-default.js";
import {
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
  ZAI_DEFAULT_MODEL_REF,
} from "../../../commands/onboard-auth.js";
import { OPENCODE_ZEN_DEFAULT_MODEL } from "../../../commands/opencode-zen-model-default.js";
import { ensureBuiltinProviderSetupHooksRegistered } from "../../builtin/setup-hooks.js";
import { ZAI_PROVIDER_CONFIG_HOOK_ID } from "../../builtin/zai/setup.js";
import { applyProviderSetupHook } from "../../setup-hooks.js";

function applyBuiltinSetupHookById(
  hookId: string,
  config: OpenClawConfig,
  context?: BuiltinProviderContext,
): OpenClawConfig {
  ensureBuiltinProviderSetupHooksRegistered();
  return applyProviderSetupHook(hookId, config, context);
}

export const BUILTIN_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
  {
    authChoice: "openrouter-api-key",
    tokenProviders: ["openrouter"],
    providerId: "openrouter",
    profileId: "openrouter:default",
    label: "OpenRouter",
    keyPrompt: "Enter OpenRouter API key",
    optionKey: "openrouterApiKey",
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
    optionKey: "aiGatewayApiKey",
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
    optionKey: "cloudflareAiGatewayApiKey",
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
    resolveCredentialMetadata: (context) => {
      const accountId = context?.accountId?.trim();
      const gatewayId = context?.gatewayId?.trim();
      if (!accountId || !gatewayId) {
        throw new Error("Cloudflare Account ID and Gateway ID are required");
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
    optionKey: "moonshotApiKey",
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
    optionKey: "moonshotApiKey",
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
    optionKey: "kimiCodeApiKey",
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
    optionKey: "geminiApiKey",
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
    optionKey: "zaiApiKey",
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
    optionKey: "xiaomiApiKey",
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
    optionKey: "syntheticApiKey",
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
    optionKey: "veniceApiKey",
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
    optionKey: "opencodeZenApiKey",
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

export const BUILTIN_INTERACTIVE_API_KEY_BY_AUTH_CHOICE = new Map(
  BUILTIN_INTERACTIVE_API_KEY_SPECS.map((spec) => [spec.authChoice, spec]),
);

export const BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE = (() => {
  const map = new Map<string, string>();
  for (const spec of BUILTIN_INTERACTIVE_API_KEY_SPECS) {
    for (const tokenProvider of spec.tokenProviders) {
      const normalized = normalizeProviderId(tokenProvider);
      if (!map.has(normalized)) {
        map.set(normalized, spec.authChoice);
      }
    }
  }
  return map;
})();
