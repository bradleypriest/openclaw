import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const GROQ_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "groq",
  auth: {
    envVarCandidates: ["GROQ_API_KEY"],
  },
});
