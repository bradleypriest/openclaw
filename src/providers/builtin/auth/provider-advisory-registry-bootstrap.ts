import { resolveAnthropicMissingAuthHintAdvisory } from "../anthropic/provider-advisories.js";
import {
  resolveOpenAiMissingApiKeyAdvisory,
  resolveOpenAiModelConfigWarningAdvisory,
} from "../openai/provider-advisories.js";
import { registerBuiltinProviderAdvisoryHandlers } from "./provider-advisory-registry-core.js";

let registered = false;

export function ensureBuiltinProviderAdvisoryHandlersRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinProviderAdvisoryHandlers([
    {
      providerId: "openai",
      handlers: {
        resolveMissingApiKeyError: resolveOpenAiMissingApiKeyAdvisory,
        resolveModelConfigWarning: resolveOpenAiModelConfigWarningAdvisory,
      },
    },
    {
      providerId: "anthropic",
      handlers: {
        resolveMissingAuthHint: resolveAnthropicMissingAuthHintAdvisory,
      },
    },
  ]);

  registered = true;
}
