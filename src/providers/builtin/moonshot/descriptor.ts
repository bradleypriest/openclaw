import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const MOONSHOT_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "moonshot",
  auth: {
    envVarCandidates: ["MOONSHOT_API_KEY"],
  },
});
