import type { OpenClawConfig } from "../config/config.js";
import type {
  PluginManifestProviderAuthEntry,
  PluginManifestProviderAuthMethod,
} from "./manifest.js";
import type { ProviderAuthMethod, ProviderAuthKind } from "./types.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { loadPluginManifestRegistry, type PluginManifestRecord } from "./manifest-registry.js";
import { resolvePluginProviderRegistrations } from "./providers.js";

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
  method: PluginManifestProviderAuthMethod;
  methodAuthChoice?: string;
  manifestAuth?: PluginManifestProviderAuthEntry;
}): string {
  const explicit =
    normalizeOptionalString(params.methodAuthChoice) ??
    normalizeOptionalString(params.manifestAuth?.authChoice);
  if (explicit) {
    return explicit;
  }
  return `${PLUGIN_AUTH_CHOICE_PREFIX}:${params.pluginId}:${params.providerId}:${params.method}`;
}

function mapProviderAuthKind(kind: ProviderAuthKind): PluginManifestProviderAuthMethod {
  if (kind === "api_key") {
    return "api-key";
  }
  if (kind === "device_code") {
    return "device-code";
  }
  return kind;
}

function resolveManifestProviderAuthEntry(params: {
  plugin?: PluginManifestRecord;
  providerId: string;
  method: PluginManifestProviderAuthMethod;
}): PluginManifestProviderAuthEntry | undefined {
  const entries = params.plugin?.providerAuth;
  if (!entries) {
    return undefined;
  }

  for (const [rawProviderId, auth] of Object.entries(entries)) {
    if (normalizeProviderId(rawProviderId) !== normalizeProviderId(params.providerId)) {
      continue;
    }
    if (auth.method !== params.method) {
      continue;
    }
    return auth;
  }

  return undefined;
}

function normalizeStringList(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim() ?? "").filter(Boolean))];
}

function buildSpecFromRegisteredMethod(params: {
  pluginId: string;
  providerIdRaw: string;
  providerLabel?: string;
  method: ProviderAuthMethod;
  manifestAuth?: PluginManifestProviderAuthEntry;
  providerEnvVars?: string[];
}): DeclarativeProviderAuthSpec {
  const providerId = normalizeProviderId(params.providerIdRaw);
  const method = mapProviderAuthKind(params.method.kind);
  const label =
    normalizeOptionalString(params.method.label) ??
    normalizeOptionalString(params.manifestAuth?.label) ??
    normalizeOptionalString(params.providerLabel) ??
    providerId;
  const hint =
    normalizeOptionalString(params.method.hint) ??
    normalizeOptionalString(params.manifestAuth?.hint);
  const groupId =
    normalizeProviderId(
      normalizeOptionalString(params.method.group) ??
        normalizeOptionalString(params.manifestAuth?.group) ??
        providerId,
    ) || providerId;
  const groupLabel =
    normalizeOptionalString(params.method.groupLabel) ??
    normalizeOptionalString(params.manifestAuth?.groupLabel) ??
    normalizeOptionalString(params.providerLabel) ??
    label;
  const groupHint =
    normalizeOptionalString(params.method.groupHint) ??
    normalizeOptionalString(params.manifestAuth?.groupHint);
  const profileId =
    normalizeOptionalString(params.method.profileId) ??
    normalizeOptionalString(params.manifestAuth?.profileId) ??
    `${providerId}:default`;
  const keyPrompt =
    normalizeOptionalString(params.method.keyPrompt) ??
    normalizeOptionalString(params.manifestAuth?.keyPrompt) ??
    `Enter ${label} API key`;

  return {
    pluginId: params.pluginId,
    providerId,
    authChoice: buildAuthChoice({
      pluginId: params.pluginId,
      providerId,
      method,
      methodAuthChoice: params.method.authChoice,
      manifestAuth: params.manifestAuth,
    }),
    method,
    label,
    hint,
    groupId,
    groupLabel,
    groupHint,
    envVars: normalizeStringList([
      ...(params.method.envVars ?? []),
      ...(params.manifestAuth?.envVars ?? []),
      ...(params.providerEnvVars ?? []),
    ]),
    defaultModel:
      normalizeOptionalString(params.method.defaultModel) ??
      normalizeOptionalString(params.manifestAuth?.defaultModel),
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
  const workspaceDir = resolveWorkspaceDir(params);
  const registry = loadPluginManifestRegistry({
    config: params.config,
    workspaceDir,
    cache: params.cache,
  });
  const pluginById = new Map(registry.plugins.map((plugin) => [plugin.id, plugin]));
  const registrations = resolvePluginProviderRegistrations({
    config: params.config,
    workspaceDir,
  });
  const specs: DeclarativeProviderAuthSpec[] = [];
  const seenChoices = new Set<string>();

  for (const registration of registrations) {
    const plugin = pluginById.get(registration.pluginId);
    const provider = registration.provider;
    for (const method of provider.auth) {
      const mappedMethod = mapProviderAuthKind(method.kind);
      const manifestAuth = resolveManifestProviderAuthEntry({
        plugin,
        providerId: provider.id,
        method: mappedMethod,
      });
      const spec = buildSpecFromRegisteredMethod({
        pluginId: registration.pluginId,
        providerIdRaw: provider.id,
        providerLabel: provider.label,
        method,
        manifestAuth,
        providerEnvVars: provider.envVars,
      });
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
