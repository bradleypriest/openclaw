import { normalizeProviderId } from "./provider-id.js";

const PROVIDER_ENV_VAR_CANDIDATES = new Map<string, Set<string>>();

export function registerProviderEnvVarCandidates(providerRaw: string, envVars: string[]): void {
  const provider = normalizeProviderId(providerRaw);
  if (!provider) {
    return;
  }
  const existing = PROVIDER_ENV_VAR_CANDIDATES.get(provider) ?? new Set<string>();
  for (const envVar of envVars) {
    const normalized = envVar.trim().toUpperCase();
    if (/^[A-Z][A-Z0-9_]+$/.test(normalized)) {
      existing.add(normalized);
    }
  }
  PROVIDER_ENV_VAR_CANDIDATES.set(provider, existing);
}

export function resolveRegisteredProviderEnvVarCandidates(providerRaw: string): string[] {
  const provider = normalizeProviderId(providerRaw);
  return [...(PROVIDER_ENV_VAR_CANDIDATES.get(provider) ?? new Set<string>())];
}

export function listRegisteredProviderEnvVarCandidateProviders(): string[] {
  return [...PROVIDER_ENV_VAR_CANDIDATES.keys()];
}
