import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const VENICE_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "venice",
  auth: {
    envVarCandidates: ["VENICE_API_KEY"],
  },
});
