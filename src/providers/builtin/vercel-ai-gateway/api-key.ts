import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import type { AuthChoice } from "../auth/onboard-types.js";
import {
  applyVercelAiGatewayConfig,
  applyVercelAiGatewayProviderConfig,
  VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
} from "./config.js";

export const VERCEL_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
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
];

export const VERCEL_AI_GATEWAY_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] = [
  {
    authChoice: "ai-gateway-api-key",
    providerId: "vercel-ai-gateway",
    profileId: "vercel-ai-gateway:default",
    optionKey: "aiGatewayApiKey",
    flagName: "--ai-gateway-api-key",
    envVar: "AI_GATEWAY_API_KEY",
    applyConfig: (config) => applyVercelAiGatewayConfig(config),
  },
];

export const VERCEL_AI_GATEWAY_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  "vercel-ai-gateway": "ai-gateway-api-key",
};
