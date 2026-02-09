import type { BuiltinProviderDescriptor } from "./descriptor-types.js";
import { normalizeProviderId } from "../provider-id.js";

const providerDescriptors: BuiltinProviderDescriptor[] = [];
const providerDescriptorById = new Map<string, BuiltinProviderDescriptor>();

export function registerBuiltinProviderDescriptors(descriptors: BuiltinProviderDescriptor[]): void {
  for (const descriptor of descriptors) {
    const providerId = normalizeProviderId(descriptor.providerId);
    if (!providerId || providerDescriptorById.has(providerId)) {
      continue;
    }
    providerDescriptorById.set(providerId, descriptor);
    providerDescriptors.push(descriptor);
  }
}

export function listRegisteredBuiltinProviderDescriptors(): BuiltinProviderDescriptor[] {
  return [...providerDescriptors];
}

export function resolveRegisteredBuiltinProviderDescriptor(
  providerRaw?: string,
): BuiltinProviderDescriptor | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  return providerDescriptorById.get(normalizeProviderId(provider));
}
