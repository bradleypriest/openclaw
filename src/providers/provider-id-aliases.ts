const providerIdAliases = new Map<string, string>();

export function registerProviderIdAliases(aliases: Record<string, string>): void {
  for (const [aliasRaw, providerRaw] of Object.entries(aliases)) {
    const alias = aliasRaw.trim().toLowerCase();
    const provider = providerRaw.trim().toLowerCase();
    if (!alias || !provider || providerIdAliases.has(alias)) {
      continue;
    }
    providerIdAliases.set(alias, provider);
  }
}

export function resolveProviderIdAlias(aliasRaw: string): string | undefined {
  const alias = aliasRaw.trim().toLowerCase();
  if (!alias) {
    return undefined;
  }
  return providerIdAliases.get(alias);
}
