import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const QWEN_PORTAL_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "qwen-portal",
  auth: {
    envVarCandidates: ["QWEN_OAUTH_TOKEN", "QWEN_PORTAL_API_KEY"],
  },
});
