import { isOpenRouterCacheTtlEligibleModel } from "../openrouter/cache-ttl.js";
import { registerBuiltinCacheTtlEligibilityHooks } from "./cache-ttl-registry-core.js";

let registered = false;

export function ensureBuiltinCacheTtlEligibilityHooksRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinCacheTtlEligibilityHooks([
    { providerId: "openrouter", hook: isOpenRouterCacheTtlEligibleModel },
  ]);

  registered = true;
}
