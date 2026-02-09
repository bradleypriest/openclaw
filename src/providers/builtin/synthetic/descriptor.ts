import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const SYNTHETIC_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "synthetic",
  auth: {
    envVarCandidates: ["SYNTHETIC_API_KEY"],
  },
});
