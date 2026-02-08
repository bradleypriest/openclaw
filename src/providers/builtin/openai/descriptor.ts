import { defineBuiltinProviderDescriptor } from "../descriptor-types.js";

const OPENAI_FAMILY_TAGS = ["openai-family"] as const;

export const OPENAI_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "openai",
  auth: {
    envVarCandidates: ["OPENAI_API_KEY"],
  },
  runtime: {
    tags: [...OPENAI_FAMILY_TAGS],
  },
});

export const OPENAI_CODEX_PROVIDER_DESCRIPTOR = defineBuiltinProviderDescriptor({
  providerId: "openai-codex",
  auth: {
    envVarCandidates: ["OPENAI_API_KEY"],
  },
  runtime: {
    tags: [...OPENAI_FAMILY_TAGS],
  },
});
