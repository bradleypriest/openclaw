import type { OpenClawConfig } from "../config/config.js";
import type {
  PluginManifestProviderAuthEntry,
  PluginManifestProviderAuthMethod,
} from "./manifest.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { loadPluginManifestRegistry, type PluginManifestRecord } from "./manifest-registry.js";

export const PLUGIN_AUTH_CHOICE_PREFIX = "plugin";

export type DeclarativeProviderAuthSpec = {
  pluginId: string;
  providerId: string;
  authChoice: string;
  method: PluginManifestProviderAuthMethod;
  label: string;
  hint?: string;
  groupId: string;
  groupLabel: string;
  groupHint?: string;
  envVars: string[];
  defaultModel?: string;
  profileId: string;
  keyPrompt: string;
};

function normalizeOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveWorkspaceDir(params: {
  config?: OpenClawConfig;
  workspaceDir?: string;
}): string | undefined {
  const explicit = normalizeOptionalString(params.workspaceDir);
  if (explicit) {
    return explicit;
  }
  const fromConfig = params.config?.agents?.defaults?.workspace;
  return typeof fromConfig === "string" ? normalizeOptionalString(fromConfig) : undefined;
}

function buildAuthChoice(params: {
  pluginId: string;
  providerId: string;
  auth: PluginManifestProviderAuthEntry;
}): string {
  const explicit = normalizeOptionalString(params.auth.authChoice);
  if (explicit) {
    return explicit;
  }
  return `${PLUGIN_AUTH_CHOICE_PREFIX}:${params.pluginId}:${params.providerId}:${params.auth.method}`;
}

function buildSpec(params: {
  plugin: PluginManifestRecord;
  providerIdRaw: string;
  auth: PluginManifestProviderAuthEntry;
}): DeclarativeProviderAuthSpec {
  const providerId = normalizeProviderId(params.providerIdRaw);
  const label = normalizeOptionalString(params.auth.label) ?? providerId;
  const hint = normalizeOptionalString(params.auth.hint);
  const groupId =
    normalizeProviderId(normalizeOptionalString(params.auth.group) ?? providerId) || providerId;
  const groupLabel = normalizeOptionalString(params.auth.groupLabel) ?? label;
  const groupHint = normalizeOptionalString(params.auth.groupHint);
  const profileId = normalizeOptionalString(params.auth.profileId) ?? `${providerId}:default`;
  const keyPrompt = normalizeOptionalString(params.auth.keyPrompt) ?? `Enter ${label} API key`;

  return {
    pluginId: params.plugin.id,
    providerId,
    authChoice: buildAuthChoice({
      pluginId: params.plugin.id,
      providerId,
      auth: params.auth,
    }),
    method: params.auth.method,
    label,
    hint,
    groupId,
    groupLabel,
    groupHint,
    envVars: params.auth.envVars ?? [],
    defaultModel: normalizeOptionalString(params.auth.defaultModel),
    profileId,
    keyPrompt,
  };
}

export function resolveDeclarativeProviderAuthSpecs(
  params: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    cache?: boolean;
  } = {},
): DeclarativeProviderAuthSpec[] {
  const registry = loadPluginManifestRegistry({
    config: params.config,
    workspaceDir: resolveWorkspaceDir(params),
    cache: params.cache,
  });
  const specs: DeclarativeProviderAuthSpec[] = [];
  const seenChoices = new Set<string>();

  for (const plugin of registry.plugins) {
    const providerAuth = plugin.providerAuth;
    if (!providerAuth) {
      continue;
    }
    for (const [providerIdRaw, auth] of Object.entries(providerAuth)) {
      const spec = buildSpec({ plugin, providerIdRaw, auth });
      if (seenChoices.has(spec.authChoice)) {
        continue;
      }
      seenChoices.add(spec.authChoice);
      specs.push(spec);
    }
  }

  return specs;
}

export function findDeclarativeProviderAuthByChoice(
  authChoice: string,
  params: { config?: OpenClawConfig; workspaceDir?: string; cache?: boolean } = {},
): DeclarativeProviderAuthSpec | undefined {
  const resolved = normalizeOptionalString(authChoice);
  if (!resolved) {
    return undefined;
  }
  return resolveDeclarativeProviderAuthSpecs(params).find((spec) => spec.authChoice === resolved);
}

export function findDeclarativeProviderAuthByTokenProvider(
  tokenProvider: string,
  params: { config?: OpenClawConfig; workspaceDir?: string; cache?: boolean } = {},
): DeclarativeProviderAuthSpec | undefined {
  const normalized = normalizeProviderId(tokenProvider);
  return resolveDeclarativeProviderAuthSpecs(params).find(
    (spec) => spec.method === "api-key" && normalizeProviderId(spec.providerId) === normalized,
  );
}

export function findDeclarativeProviderAuthByProvider(
  provider: string,
  params: { config?: OpenClawConfig; workspaceDir?: string; cache?: boolean } = {},
): DeclarativeProviderAuthSpec | undefined {
  const normalized = normalizeProviderId(provider);
  return resolveDeclarativeProviderAuthSpecs(params).find(
    (spec) => normalizeProviderId(spec.providerId) === normalized,
  );
}
