import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const CHUTES_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "chutes",
  auth: {
    envVarCandidates: ["CHUTES_OAUTH_TOKEN", "CHUTES_API_KEY"],
  },
});
