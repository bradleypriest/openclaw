import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const MINIMAX_PORTAL_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "minimax-portal",
  auth: {
    envVarCandidates: ["MINIMAX_OAUTH_TOKEN", "MINIMAX_API_KEY"],
  },
  runtime: {
    tags: ["external-cli-oauth"],
  },
});
