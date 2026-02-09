import { resolveOpenCodeThoughtSignatureSanitizationPolicy } from "../opencode/thought-signature.js";
import { resolveOpenRouterThoughtSignatureSanitizationPolicy } from "../openrouter/thought-signature.js";
import { registerBuiltinThoughtSignatureSanitizationHooks } from "./thought-signature-registry-core.js";

let registered = false;

export function ensureBuiltinThoughtSignatureSanitizationHooksRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinThoughtSignatureSanitizationHooks([
    {
      providerId: "openrouter",
      hook: resolveOpenRouterThoughtSignatureSanitizationPolicy,
    },
    {
      providerId: "opencode",
      hook: resolveOpenCodeThoughtSignatureSanitizationPolicy,
    },
  ]);

  registered = true;
}
