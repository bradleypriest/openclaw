type BuiltinModelApiTag = "openai" | "google";

const modelApiTags = new Map<string, Set<BuiltinModelApiTag>>();

export function registerBuiltinModelApiTags(
  registrations: Array<{ api: string; tags: BuiltinModelApiTag[] }>,
): void {
  for (const registration of registrations) {
    const api = registration.api.trim().toLowerCase();
    if (!api) {
      continue;
    }
    const current = modelApiTags.get(api) ?? new Set<BuiltinModelApiTag>();
    for (const tag of registration.tags) {
      current.add(tag);
    }
    modelApiTags.set(api, current);
  }
}

export function hasBuiltinModelApiTag(
  apiRaw: string | null | undefined,
  tag: BuiltinModelApiTag,
): boolean {
  const api = apiRaw?.trim().toLowerCase();
  if (!api) {
    return false;
  }
  return modelApiTags.get(api)?.has(tag) ?? false;
}
