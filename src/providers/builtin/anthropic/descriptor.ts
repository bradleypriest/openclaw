import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";
import { validateAnthropicSetupToken } from "./setup-token.js";

export const ANTHROPIC_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "anthropic",
  auth: {
    envVarCandidates: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
  },
  runtime: {
    tags: ["anthropic", "supports-cache-retention"],
  },
  setup: {
    token: {
      label: "anthropic",
      confirmMessage: "Have you run `claude setup-token` and copied the token?",
      tokenPrompt: "Paste Anthropic setup-token",
      methodLabel: "setup-token (claude)",
      methodHint: "Paste a setup-token from `claude setup-token`",
      validateToken: validateAnthropicSetupToken,
    },
  },
});
