import { normalizeProviderId } from "../../provider-id.js";

type BuiltinCacheTtlEligibilityHook = (modelId: string) => boolean;

const CACHE_TTL_ELIGIBILITY_HOOKS: Record<string, BuiltinCacheTtlEligibilityHook> = {
  openrouter: (modelId) => modelId.toLowerCase().startsWith("anthropic/"),
};

export function isCacheTtlEligibleViaProviderHook(params: {
  provider: string;
  modelId: string;
}): boolean {
  const hook = CACHE_TTL_ELIGIBILITY_HOOKS[normalizeProviderId(params.provider)];
  if (!hook) {
    return false;
  }
  return hook(params.modelId);
}
