import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

export const GITHUB_COPILOT_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "github-copilot",
  auth: {
    envVarCandidates: ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"],
  },
  runtime: {
    tags: ["copilot"],
  },
});
