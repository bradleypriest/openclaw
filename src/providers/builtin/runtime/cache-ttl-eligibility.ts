import { ensureBuiltinCacheTtlEligibilityHooksRegistered } from "./cache-ttl-registry-bootstrap.js";
import { resolveBuiltinCacheTtlEligibilityHook } from "./cache-ttl-registry-core.js";

export function isCacheTtlEligibleViaProviderHook(params: {
  provider: string;
  modelId: string;
}): boolean {
  ensureBuiltinCacheTtlEligibilityHooksRegistered();
  const hook = resolveBuiltinCacheTtlEligibilityHook(params.provider);
  if (!hook) {
    return false;
  }
  return hook(params.modelId);
}
