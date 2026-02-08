import { normalizeProviderId } from "../../provider-id.js";
import { listBuiltinNonInteractiveApiKeySpecs } from "../api-key/non-interactive-specs.js";
import { listBuiltinProviderAuthAttributes } from "./provider-auth-attributes.js";

const BUILTIN_PROVIDER_ENV_VAR_CANDIDATES: Record<string, string[]> = (() => {
  const map = new Map<string, Set<string>>();

  const add = (providerRaw: string, envVarRaw: string) => {
    const provider = normalizeProviderId(providerRaw);
    const candidates = envVarRaw.match(/[A-Z][A-Z0-9_]+/g) ?? [];
    if (candidates.length === 0) {
      return;
    }
    const current = map.get(provider) ?? new Set<string>();
    for (const candidate of candidates) {
      current.add(candidate);
    }
    map.set(provider, current);
  };

  for (const spec of listBuiltinNonInteractiveApiKeySpecs()) {
    add(spec.providerId, spec.envVar);
  }

  for (const providerAuth of listBuiltinProviderAuthAttributes()) {
    const envVars = providerAuth.envVarCandidates;
    if (!envVars?.length) {
      continue;
    }
    for (const envVar of envVars) {
      add(providerAuth.providerId, envVar);
    }
  }

  return Object.fromEntries(
    [...map.entries()].map(([provider, envVars]) => [provider, [...envVars]]),
  );
})();

export function resolveBuiltinProviderEnvVarCandidates(provider: string): string[] {
  const normalized = normalizeProviderId(provider);
  return BUILTIN_PROVIDER_ENV_VAR_CANDIDATES[normalized] ?? [];
}

export function listBuiltinProviderEnvVarCandidateProviders(): string[] {
  return Object.keys(BUILTIN_PROVIDER_ENV_VAR_CANDIDATES);
}

export function listBuiltinProviderEnvVarCandidateKeys(): string[] {
  return [...new Set(Object.values(BUILTIN_PROVIDER_ENV_VAR_CANDIDATES).flat())];
}
