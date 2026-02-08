import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const ZAI_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "zai",
  auth: {
    envVarCandidates: ["ZAI_API_KEY", "Z_AI_API_KEY"],
  },
});
