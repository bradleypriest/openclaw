import { getShellEnvAppliedKeys } from "../infra/shell-env.js";
import { resolveProviderEnvApiKey } from "./auth-env-vars.js";
import { ensureBuiltinProviderEnvApiKeyResolversRegistered } from "./builtin/env-resolvers.js";
import { normalizeProviderId } from "./provider-id.js";

export type EnvApiKeyResult = { apiKey: string; source: string };

export function resolveEnvApiKey(provider: string): EnvApiKeyResult | null {
  ensureBuiltinProviderEnvApiKeyResolversRegistered();
  const normalized = normalizeProviderId(provider);
  const applied = new Set(getShellEnvAppliedKeys());
  const pick = (envVar: string): EnvApiKeyResult | null => {
    const value = process.env[envVar]?.trim();
    if (!value) {
      return null;
    }
    const source = applied.has(envVar) ? `shell env: ${envVar}` : `env: ${envVar}`;
    return { apiKey: value, source };
  };

  return resolveProviderEnvApiKey({
    provider: normalized,
    resolveEnvVar: pick,
  });
}
