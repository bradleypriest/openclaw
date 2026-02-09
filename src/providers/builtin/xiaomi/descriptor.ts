import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const XIAOMI_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "xiaomi",
  auth: {
    envVarCandidates: ["XIAOMI_API_KEY"],
  },
});
