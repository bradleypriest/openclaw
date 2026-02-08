import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const GOOGLE_GEMINI_CLI_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "google-gemini-cli",
  runtime: {
    tags: ["google-provider", "requires-oauth-project-id"],
  },
});
