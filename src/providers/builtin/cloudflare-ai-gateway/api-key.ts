import type { AuthChoice } from "../../../commands/onboard-types.js";
import type {
  BuiltinInteractiveApiKeySpec,
  BuiltinNonInteractiveApiKeySpec,
} from "../api-key/types.js";
import { CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF } from "../../../commands/onboard-auth.credentials.js";
import {
  applyCloudflareAiGatewayConfig,
  applyCloudflareAiGatewayProviderConfig,
} from "./config.js";

export const CLOUDFLARE_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS: BuiltinInteractiveApiKeySpec[] = [
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
];

export const CLOUDFLARE_AI_GATEWAY_NON_INTERACTIVE_API_KEY_SPECS: BuiltinNonInteractiveApiKeySpec[] =
  [
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
  ];

export const CLOUDFLARE_AI_GATEWAY_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  "cloudflare-ai-gateway": "cloudflare-ai-gateway-api-key",
};
