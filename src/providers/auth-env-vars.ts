import type { OpenClawConfig } from "../config/config.js";
import { findDeclarativeProviderAuthByProvider } from "../plugins/provider-auth-manifest.js";
import {
  listBuiltinProviderEnvVarCandidateProviders,
  resolveBuiltinProviderEnvVarCandidates,
} from "./builtin/auth/env-var-candidates.js";
import { normalizeProviderId } from "./provider-id.js";

export type ProviderEnvApiKey = { apiKey: string; source: string };
export type ProviderEnvApiKeyResolver = () => ProviderEnvApiKey | null;

const providerEnvApiKeyResolvers = new Map<string, ProviderEnvApiKeyResolver>();

export function resolveProviderEnvVarCandidates(
  provider: string,
  params: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    includeDeclarative?: boolean;
  } = {},
): string[] {
  const normalized = normalizeProviderId(provider);
  const base = resolveBuiltinProviderEnvVarCandidates(normalized);
  const candidates = [...base];

  if (params.includeDeclarative !== false) {
    const declarative = findDeclarativeProviderAuthByProvider(normalized, {
      config: params.config,
      workspaceDir: params.workspaceDir,
    });
    if (declarative?.envVars?.length) {
      candidates.push(...declarative.envVars);
    }
  }

  return [...new Set(candidates.map((value) => value.trim()).filter(Boolean))];
}

export function registerProviderEnvApiKeyResolver(
  providerId: string,
  resolver: ProviderEnvApiKeyResolver,
): void {
  const normalized = normalizeProviderId(providerId);
  if (!normalized) {
    throw new Error("Provider id is required for env API key resolver");
  }
  if (providerEnvApiKeyResolvers.has(normalized)) {
    return;
  }
  providerEnvApiKeyResolvers.set(normalized, resolver);
}

export function listProviderEnvApiKeyResolverProviders(): string[] {
  return [...providerEnvApiKeyResolvers.keys()];
}

export function listProviderEnvVarCandidateProviders(): string[] {
  return [...new Set(listBuiltinProviderEnvVarCandidateProviders())];
}

export function resolveProviderEnvApiKey(params: {
  provider: string;
  resolveEnvVar: (envVar: string) => ProviderEnvApiKey | null;
  config?: OpenClawConfig;
  workspaceDir?: string;
  includeDeclarative?: boolean;
}): ProviderEnvApiKey | null {
  const normalized = normalizeProviderId(params.provider);

  const providerResolver = providerEnvApiKeyResolvers.get(normalized);
  if (providerResolver) {
    const resolved = providerResolver();
    if (resolved) {
      return resolved;
    }
  }

  for (const envVar of resolveProviderEnvVarCandidates(normalized, {
    config: params.config,
    workspaceDir: params.workspaceDir,
    includeDeclarative: params.includeDeclarative,
  })) {
    const resolved = params.resolveEnvVar(envVar);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}
