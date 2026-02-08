import type { BuiltinProviderTag } from "../descriptor-types.js";
import { normalizeProviderId } from "../../provider-id.js";
import { listBuiltinProviderDescriptors } from "../provider-descriptors.js";

const BUILTIN_PROVIDER_TAGS_BY_ID = new Map<string, Set<BuiltinProviderTag>>(
  listBuiltinProviderDescriptors().map((descriptor) => [
    descriptor.providerId,
    new Set(descriptor.runtime?.tags ?? []),
  ]),
);

export function hasBuiltinProviderTag(
  providerRaw: string | undefined,
  tag: BuiltinProviderTag,
): boolean {
  const provider = providerRaw?.trim();
  if (!provider) {
    return false;
  }
  return BUILTIN_PROVIDER_TAGS_BY_ID.get(normalizeProviderId(provider))?.has(tag) ?? false;
}
