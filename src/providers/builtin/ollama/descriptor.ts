import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const OLLAMA_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "ollama",
  auth: {
    envVarCandidates: ["OLLAMA_API_KEY"],
  },
});
