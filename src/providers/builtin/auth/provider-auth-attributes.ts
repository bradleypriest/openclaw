import type { BuiltinDefaultAuthMode } from "../descriptor-types.js";
import { normalizeProviderId } from "../../provider-id.js";
import { listBuiltinProviderDescriptors } from "../provider-descriptors.js";

export type BuiltinProviderAuthAttributes = {
  providerId: string;
  defaultAuthMode?: BuiltinDefaultAuthMode;
  envVarCandidates?: string[];
};

const BUILTIN_PROVIDER_AUTH_ATTRIBUTES: BuiltinProviderAuthAttributes[] =
  listBuiltinProviderDescriptors().flatMap((descriptor) => {
    if (!descriptor.auth) {
      return [];
    }
    return [
      {
        providerId: descriptor.providerId,
        defaultAuthMode: descriptor.auth.defaultMode,
        envVarCandidates: descriptor.auth.envVarCandidates,
      },
    ];
  });

const BUILTIN_PROVIDER_AUTH_ATTRIBUTES_BY_ID = new Map(
  BUILTIN_PROVIDER_AUTH_ATTRIBUTES.map((entry) => [entry.providerId, entry]),
);

export function listBuiltinProviderAuthAttributes(): BuiltinProviderAuthAttributes[] {
  return [...BUILTIN_PROVIDER_AUTH_ATTRIBUTES];
}

export function resolveBuiltinProviderAuthAttributes(
  providerRaw?: string,
): BuiltinProviderAuthAttributes | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  return BUILTIN_PROVIDER_AUTH_ATTRIBUTES_BY_ID.get(normalizeProviderId(provider));
}
