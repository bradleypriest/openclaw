import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const GOOGLE_ANTIGRAVITY_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "google-antigravity",
  runtime: {
    tags: ["google-provider", "google-antigravity", "requires-oauth-project-id"],
  },
});
