import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const GOOGLE_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "google",
  runtime: {
    tags: ["google-provider"],
  },
});
