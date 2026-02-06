import type { OpenClawConfig } from "../../config/config.js";
import { normalizeProviderId } from "../../agents/model-selection.js";
import { installPluginFromNpmSpec } from "../../plugins/install.js";
import { loadPluginManifest } from "../../plugins/manifest.js";
import {
  resolveDeclarativeProviderAuthSpecs,
  type DeclarativeProviderAuthSpec,
} from "../../plugins/provider-auth-manifest.js";

type ProviderInstallLogger = {
  info?: (message: string) => void;
  warn?: (message: string) => void;
};

export type InstalledCommunityProviderAuth = {
  authChoice: string;
  providerId: string;
  label: string;
  hint?: string;
  pluginId: string;
};

export type InstallCommunityProviderResult =
  | {
      ok: true;
      npmSpec: string;
      pluginId: string;
      pluginName: string;
      authChoices: InstalledCommunityProviderAuth[];
    }
  | {
      ok: false;
      npmSpec: string;
      error: string;
    };

function resolveInstalledProviderAuthChoices(params: {
  pluginId: string;
  config?: OpenClawConfig;
  workspaceDir?: string;
}): InstalledCommunityProviderAuth[] {
  const specs = resolveDeclarativeProviderAuthSpecs({
    config: params.config,
    workspaceDir: params.workspaceDir,
    cache: false,
  });

  return specs
    .filter((spec) => spec.pluginId === params.pluginId && spec.method === "api-key")
    .map((spec: DeclarativeProviderAuthSpec) => ({
      authChoice: spec.authChoice,
      providerId: spec.providerId,
      label: spec.label,
      hint: spec.hint,
      pluginId: spec.pluginId,
    }));
}

export function resolveInstalledCommunityProviderAuthChoice(params: {
  authChoices: InstalledCommunityProviderAuth[];
  provider?: string;
}): InstalledCommunityProviderAuth | undefined {
  if (params.authChoices.length === 1) {
    return params.authChoices[0];
  }

  const provider = params.provider?.trim();
  if (!provider) {
    return undefined;
  }

  const normalized = normalizeProviderId(provider);
  return params.authChoices.find((entry) => normalizeProviderId(entry.providerId) === normalized);
}

export async function installCommunityProviderFromNpm(params: {
  npmSpec: string;
  config?: OpenClawConfig;
  workspaceDir?: string;
  logger?: ProviderInstallLogger;
}): Promise<InstallCommunityProviderResult> {
  const npmSpec = params.npmSpec.trim();
  if (!npmSpec) {
    return {
      ok: false,
      npmSpec,
      error: "npm package name is required",
    };
  }

  const installResult = await installPluginFromNpmSpec({
    spec: npmSpec,
    logger: params.logger,
  });
  if (!installResult.ok) {
    return {
      ok: false,
      npmSpec,
      error: installResult.error,
    };
  }

  const manifestResult = loadPluginManifest(installResult.targetDir);
  if (!manifestResult.ok) {
    return {
      ok: false,
      npmSpec,
      error: `installed plugin manifest is invalid: ${manifestResult.error}`,
    };
  }

  const pluginId = manifestResult.manifest.id;
  const pluginName = manifestResult.manifest.name?.trim() || pluginId;
  const authChoices = resolveInstalledProviderAuthChoices({
    pluginId,
    config: params.config,
    workspaceDir: params.workspaceDir,
  });

  if (authChoices.length === 0) {
    return {
      ok: false,
      npmSpec,
      error: `Plugin "${pluginName}" does not declare any API-key providerAuth entries`,
    };
  }

  return {
    ok: true,
    npmSpec,
    pluginId,
    pluginName,
    authChoices,
  };
}
