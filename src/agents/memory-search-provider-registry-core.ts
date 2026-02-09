import type { ResolvedMemorySearchConfig } from "./memory-search.js";

type MemorySearchProvider = ResolvedMemorySearchConfig["provider"];

type MemorySearchProviderBehavior = {
  includeRemoteByDefault: boolean;
  defaultModel?: string;
};

const memorySearchProviderBehaviors = new Map<MemorySearchProvider, MemorySearchProviderBehavior>();

export function registerMemorySearchProviderBehaviors(
  registrations: Array<{ provider: MemorySearchProvider; behavior: MemorySearchProviderBehavior }>,
): void {
  for (const registration of registrations) {
    if (memorySearchProviderBehaviors.has(registration.provider)) {
      continue;
    }
    memorySearchProviderBehaviors.set(registration.provider, registration.behavior);
  }
}

export function resolveMemorySearchProviderBehavior(
  provider: MemorySearchProvider,
): MemorySearchProviderBehavior {
  return memorySearchProviderBehaviors.get(provider) ?? { includeRemoteByDefault: false };
}
