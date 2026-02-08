import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const CEREBRAS_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "cerebras",
  auth: {
    envVarCandidates: ["CEREBRAS_API_KEY"],
  },
});
