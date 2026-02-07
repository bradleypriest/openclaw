import type { OpenClawConfig } from "../config/config.js";
import type { ProviderAuthMethod, ProviderAuthKind } from "./types.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { resolvePluginProviderRegistrations } from "./providers.js";

export const PLUGIN_AUTH_CHOICE_PREFIX = "plugin";

export type DeclarativeProviderAuthMethod =
  | "api-key"
  | "oauth"
  | "token"
  | "device-code"
  | "custom";

export type DeclarativeProviderAuthSpec = {
  pluginId: string;
  providerId: string;
  authChoice: string;
  method: DeclarativeProviderAuthMethod;
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
  method: DeclarativeProviderAuthMethod;
  methodAuthChoice?: string;
}): string {
  const explicit = normalizeOptionalString(params.methodAuthChoice);
  if (explicit) {
    return explicit;
  }
  return `${PLUGIN_AUTH_CHOICE_PREFIX}:${params.pluginId}:${params.providerId}:${params.method}`;
}

function mapProviderAuthKind(kind: ProviderAuthKind): DeclarativeProviderAuthMethod {
  if (kind === "api_key") {
    return "api-key";
  }
  if (kind === "device_code") {
    return "device-code";
  }
  return kind;
}

function normalizeStringList(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim() ?? "").filter(Boolean))];
}

function buildSpecFromRegisteredMethod(params: {
  pluginId: string;
  providerIdRaw: string;
  providerLabel?: string;
  method: ProviderAuthMethod;
  providerEnvVars?: string[];
}): DeclarativeProviderAuthSpec {
  const providerId = normalizeProviderId(params.providerIdRaw);
  const method = mapProviderAuthKind(params.method.kind);
  const label =
    normalizeOptionalString(params.method.label) ??
    normalizeOptionalString(params.providerLabel) ??
    providerId;
  const hint = normalizeOptionalString(params.method.hint);
  const groupId =
    normalizeProviderId(normalizeOptionalString(params.method.group) ?? providerId) || providerId;
  const groupLabel =
    normalizeOptionalString(params.method.groupLabel) ??
    normalizeOptionalString(params.providerLabel) ??
    label;
  const groupHint = normalizeOptionalString(params.method.groupHint);
  const profileId = normalizeOptionalString(params.method.profileId) ?? `${providerId}:default`;
  const keyPrompt = normalizeOptionalString(params.method.keyPrompt) ?? `Enter ${label} API key`;

  return {
    pluginId: params.pluginId,
    providerId,
    authChoice: buildAuthChoice({
      pluginId: params.pluginId,
      providerId,
      method,
      methodAuthChoice: params.method.authChoice,
    }),
    method,
    label,
    hint,
    groupId,
    groupLabel,
    groupHint,
    envVars: normalizeStringList([
      ...(params.method.envVars ?? []),
      ...(params.providerEnvVars ?? []),
    ]),
    defaultModel: normalizeOptionalString(params.method.defaultModel),
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
  const registrations = resolvePluginProviderRegistrations({
    config: params.config,
    workspaceDir,
  });
  const specs: DeclarativeProviderAuthSpec[] = [];
  const seenChoices = new Set<string>();

  for (const registration of registrations) {
    const provider = registration.provider;
    for (const method of provider.auth) {
      const spec = buildSpecFromRegisteredMethod({
        pluginId: registration.pluginId,
        providerIdRaw: provider.id,
        providerLabel: provider.label,
        method,
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
