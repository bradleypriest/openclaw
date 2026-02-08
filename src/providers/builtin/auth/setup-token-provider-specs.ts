import type { BuiltinSetupTokenProviderSpec } from "../descriptor-types.js";
import { normalizeProviderId } from "../../provider-id.js";
import { listBuiltinProviderDescriptors } from "../provider-descriptors.js";

export type { BuiltinSetupTokenProviderSpec };

const BUILTIN_SETUP_TOKEN_PROVIDER_SPECS: BuiltinSetupTokenProviderSpec[] =
  listBuiltinProviderDescriptors().flatMap((descriptor) => {
    if (!descriptor.setup?.token) {
      return [];
    }
    return [{ providerId: descriptor.providerId, ...descriptor.setup.token }];
  });

const BUILTIN_SETUP_TOKEN_PROVIDER_SPEC_BY_ID = new Map(
  BUILTIN_SETUP_TOKEN_PROVIDER_SPECS.map((entry) => [entry.providerId, entry]),
);

export function listBuiltinSetupTokenProviderSpecs(): BuiltinSetupTokenProviderSpec[] {
  return [...BUILTIN_SETUP_TOKEN_PROVIDER_SPECS];
}

export function resolveBuiltinSetupTokenProviderSpec(
  providerRaw?: string,
): BuiltinSetupTokenProviderSpec | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  return BUILTIN_SETUP_TOKEN_PROVIDER_SPEC_BY_ID.get(normalizeProviderId(provider));
}
