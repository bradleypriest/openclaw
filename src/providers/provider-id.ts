import { ensureProviderIdAliasesRegistered } from "./provider-id-alias-registry.js";
import { resolveProviderIdAlias } from "./provider-id-aliases.js";

export function normalizeProviderId(provider: string): string {
  const normalized = provider.trim().toLowerCase();
  ensureProviderIdAliasesRegistered();
  return resolveProviderIdAlias(normalized) ?? normalized;
}
