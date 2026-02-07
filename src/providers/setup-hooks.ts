import type { OpenClawConfig } from "../config/config.js";

export type ProviderSetupHookContext = {
  accountId?: string;
  gatewayId?: string;
};

export type ProviderSetupHook = (
  config: OpenClawConfig,
  context?: ProviderSetupHookContext,
) => OpenClawConfig;

const providerSetupHooks = new Map<string, ProviderSetupHook>();

export function registerProviderSetupHook(hookId: string, hook: ProviderSetupHook): void {
  const normalizedId = hookId.trim();
  if (!normalizedId) {
    throw new Error("Provider setup hook id is required");
  }
  if (providerSetupHooks.has(normalizedId)) {
    return;
  }
  providerSetupHooks.set(normalizedId, hook);
}

export function applyProviderSetupHook(
  hookId: string,
  config: OpenClawConfig,
  context?: ProviderSetupHookContext,
): OpenClawConfig {
  const normalizedId = hookId.trim();
  const hook = providerSetupHooks.get(normalizedId);
  if (!hook) {
    throw new Error(`Unknown provider setup hook: ${hookId}`);
  }
  return hook(config, context);
}
