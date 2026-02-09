import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const CLOUDFLARE_AI_GATEWAY_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "cloudflare-ai-gateway",
  auth: {
    envVarCandidates: ["CLOUDFLARE_AI_GATEWAY_API_KEY"],
  },
});
