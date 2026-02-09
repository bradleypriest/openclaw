import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const XAI_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "xai",
  auth: {
    envVarCandidates: ["XAI_API_KEY"],
  },
});
