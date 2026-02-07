import type { ProviderPlugin } from "./types.js";
import { createSubsystemLogger } from "../logging/subsystem.js";
import { loadOpenClawPlugins, type PluginLoadOptions } from "./loader.js";

const log = createSubsystemLogger("plugins");

export type ResolvedPluginProviderRegistration = {
  pluginId: string;
  provider: ProviderPlugin;
};

export function resolvePluginProviderRegistrations(params: {
  config?: PluginLoadOptions["config"];
  workspaceDir?: string;
}): ResolvedPluginProviderRegistration[] {
  const registry = loadOpenClawPlugins({
    config: params.config,
    workspaceDir: params.workspaceDir,
    logger: {
      info: (msg) => log.info(msg),
      warn: (msg) => log.warn(msg),
      error: (msg) => log.error(msg),
      debug: (msg) => log.debug(msg),
    },
  });

  return registry.providers.map((entry) => ({
    pluginId: entry.pluginId,
    provider: entry.provider,
  }));
}

export function resolvePluginProviders(params: {
  config?: PluginLoadOptions["config"];
  workspaceDir?: string;
}): ProviderPlugin[] {
  return resolvePluginProviderRegistrations(params).map((entry) => entry.provider);
}
