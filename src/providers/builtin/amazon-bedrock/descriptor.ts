import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const AMAZON_BEDROCK_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "amazon-bedrock",
  auth: {
    defaultMode: "aws-sdk",
  },
});
