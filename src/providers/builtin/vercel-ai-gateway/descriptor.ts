import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const VERCEL_AI_GATEWAY_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "vercel-ai-gateway",
  auth: {
    envVarCandidates: ["AI_GATEWAY_API_KEY"],
  },
});
