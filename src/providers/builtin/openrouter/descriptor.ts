import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const OPENROUTER_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "openrouter",
  runtime: {
    tags: ["openrouter"],
  },
});
