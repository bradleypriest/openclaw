import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const OPENCODE_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "opencode",
  auth: {
    envVarCandidates: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
  },
  runtime: {
    tags: ["sanitize-gemini-thought-signatures"],
  },
});
