import { normalizeProviderId } from "../../provider-id.js";

export type BuiltinDefaultAuthMode = "aws-sdk";

const BUILTIN_DEFAULT_AUTH_MODE_BY_PROVIDER: Record<string, BuiltinDefaultAuthMode> = {
  "amazon-bedrock": "aws-sdk",
};

export function resolveBuiltinDefaultAuthMode(
  provider: string,
): BuiltinDefaultAuthMode | undefined {
  const normalized = normalizeProviderId(provider);
  return BUILTIN_DEFAULT_AUTH_MODE_BY_PROVIDER[normalized];
}
