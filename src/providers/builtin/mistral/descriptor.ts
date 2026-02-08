import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const MISTRAL_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "mistral",
  auth: {
    envVarCandidates: ["MISTRAL_API_KEY"],
  },
});
