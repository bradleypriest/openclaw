import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const OPENROUTER_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "openrouter",
  runtime: {
    tags: ["openrouter", "sanitize-gemini-thought-signatures", "cache-ttl-via-hook"],
  },
});
