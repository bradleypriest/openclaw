import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const KIMI_CODING_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "kimi-coding",
  auth: {
    envVarCandidates: ["KIMI_API_KEY", "KIMICODE_API_KEY"],
  },
});
