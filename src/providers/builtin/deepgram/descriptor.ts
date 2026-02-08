import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const DEEPGRAM_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "deepgram",
  auth: {
    envVarCandidates: ["DEEPGRAM_API_KEY"],
  },
});
