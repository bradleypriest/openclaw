import type { AuthProfileStore } from "../agents/auth-profiles.js";
import type { OpenClawConfig } from "../config/config.js";
import type { ProviderAuthMethod, ProviderPlugin } from "../plugins/types.js";
import { normalizeProviderId } from "../agents/model-selection.js";
import { registerCoreProviders } from "./core-providers.js";

export type ProviderRegistryDiagnostic = {
  level: "error" | "warn";
  message: string;
  providerId?: string;
};

export type ProviderAuthChoiceEntry = {
  choice: string;
  providerId: string;
  label: string;
  hint?: string;
  groupId: string;
  groupLabel: string;
  groupHint?: string;
  interactiveOnly?: boolean;
  selectable?: boolean;
};

export type ProviderDescriptor = {
  auth?: {
    defaultMode?: "aws-sdk";
    envVarCandidates?: string[];
  };
  runtime?: {
    tags?: string[];
  };
  setupToken?: {
    label: string;
    confirmMessage: string;
    tokenPrompt: string;
    methodLabel: string;
    methodHint: string;
    validateToken: (value: string) => string | undefined;
  };
};

export type ProviderAdvisories = {
  resolveMissingApiKeyError?: (store: AuthProfileStore) => string | undefined;
  resolveModelConfigWarning?: (store: AuthProfileStore) => string | undefined;
  resolveMissingAuthHint?: () => string | undefined;
};

export type ProviderLegacyProfiles = {
  defaultOAuthProfileId?: string;
  deprecatedProfileIds?: string[];
};

export type ProviderRegistration = {
  id: string;
  label?: string;
  aliases?: string[];
  auth?: ProviderAuthMethod[];
  defaultModel?: string;
  configPatch?: Partial<OpenClawConfig>;
  descriptor?: ProviderDescriptor;
  authChoices?: ProviderAuthChoiceEntry[];
  advisories?: ProviderAdvisories;
  legacyProfiles?: ProviderLegacyProfiles;
};

let coreProvidersRegistered = false;

export function ensureCoreProvidersRegistered(): void {
  if (coreProvidersRegistered) {
    return;
  }
  coreProvidersRegistered = true;
  registerCoreProviders();
}

export function registerPluginProvider(provider: ProviderPlugin): void {
  const envVarCandidates = provider.envVars?.filter((envVar) => envVar.trim());
  const descriptor = envVarCandidates?.length ? { auth: { envVarCandidates } } : undefined;
  registerProvider({
    id: provider.id,
    label: provider.label,
    aliases: provider.aliases,
    auth: provider.auth,
    descriptor,
  });
}

export function listProviderAuthChoices(): ProviderAuthChoiceEntry[] {
  ensureCoreProvidersRegistered();
  const entries: ProviderAuthChoiceEntry[] = [];
  for (const provider of providerRegistry.values()) {
    if (provider.authChoices) {
      entries.push(...provider.authChoices);
    }
  }
  return entries;
}

export function resolveProviderEnvVarCandidates(providerId: string): string[] {
  ensureCoreProvidersRegistered();
  const provider = resolveProvider(providerId);
  const envVars = provider?.descriptor?.auth?.envVarCandidates ?? [];
  return envVars.map((envVar) => envVar.trim()).filter(Boolean);
}

export function resolveProviderAdvisories(providerId: string): ProviderAdvisories | undefined {
  ensureCoreProvidersRegistered();
  return resolveProvider(providerId)?.advisories;
}

export function resolveProviderLegacyProfiles(
  providerId: string,
): ProviderLegacyProfiles | undefined {
  ensureCoreProvidersRegistered();
  return resolveProvider(providerId)?.legacyProfiles;
}

const providerRegistry = new Map<string, ProviderRegistration>();
const providerDiagnostics: ProviderRegistryDiagnostic[] = [];

function pushDiagnostic(diagnostic: ProviderRegistryDiagnostic): void {
  providerDiagnostics.push(diagnostic);
}

function validateAliases(params: { providerId: string; aliases?: string[] }): {
  aliases?: string[];
  invalidAliases: string[];
} {
  if (!params.aliases) {
    return { aliases: params.aliases, invalidAliases: [] };
  }
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const raw of params.aliases) {
    if (typeof raw !== "string") {
      invalid.push("<non-string>");
      continue;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
      invalid.push("<empty>");
      continue;
    }
    const normalized = normalizeProviderId(trimmed);
    if (!normalized || normalized === params.providerId || seen.has(normalized)) {
      invalid.push(trimmed);
      continue;
    }
    seen.add(normalized);
    valid.push(trimmed);
  }
  return { aliases: valid.length > 0 ? valid : undefined, invalidAliases: invalid };
}

export function registerProvider(provider: ProviderRegistration): void {
  const idRaw = typeof provider?.id === "string" ? provider.id.trim() : "";
  if (!idRaw) {
    pushDiagnostic({
      level: "error",
      message: "provider registration missing id",
    });
    return;
  }

  const id = normalizeProviderId(idRaw);
  if (providerRegistry.has(id)) {
    pushDiagnostic({
      level: "error",
      message: `provider already registered: ${id}`,
      providerId: id,
    });
    return;
  }

  const { aliases, invalidAliases } = validateAliases({
    providerId: id,
    aliases: provider.aliases,
  });
  if (invalidAliases.length > 0) {
    pushDiagnostic({
      level: "warn",
      message: `provider alias invalid: ${invalidAliases.join(", ")}`,
      providerId: id,
    });
  }

  const { configPatch, invalidConfigPatchKeys } = validateConfigPatch(provider.configPatch);
  if (invalidConfigPatchKeys.length > 0) {
    pushDiagnostic({
      level: "error",
      message: `provider configPatch includes disallowed keys: ${invalidConfigPatchKeys.join(", ")}`,
      providerId: id,
    });
  }

  providerRegistry.set(id, { ...provider, id, aliases, configPatch });
}

export function resolveProvider(idRaw: string): ProviderRegistration | undefined {
  const id = normalizeProviderId(idRaw ?? "");
  if (!id) {
    return undefined;
  }
  return providerRegistry.get(id);
}

export function listProviders(): ProviderRegistration[] {
  return [...providerRegistry.values()];
}

export function listProviderRegistryDiagnostics(): ProviderRegistryDiagnostic[] {
  return [...providerDiagnostics];
}

export function resetProviderRegistryForTests(): void {
  providerRegistry.clear();
  providerDiagnostics.length = 0;
  coreProvidersRegistered = false;
}

function validateConfigPatch(configPatch?: Partial<OpenClawConfig>): {
  configPatch?: Partial<OpenClawConfig>;
  invalidConfigPatchKeys: string[];
} {
  if (!configPatch) {
    return { configPatch, invalidConfigPatchKeys: [] };
  }

  const invalidKeys: string[] = [];
  const rootKeys = Object.keys(configPatch);
  for (const key of rootKeys) {
    if (key === "models") {
      invalidKeys.push(...validateModelsConfig(configPatch.models));
      continue;
    }
    if (key === "agents") {
      invalidKeys.push(...validateAgentsConfig(configPatch.agents));
      continue;
    }
    invalidKeys.push(key);
  }

  if (invalidKeys.length > 0) {
    return { configPatch: undefined, invalidConfigPatchKeys: invalidKeys };
  }
  return { configPatch, invalidConfigPatchKeys: [] };
}

function validateModelsConfig(models: OpenClawConfig["models"]): string[] {
  if (!models || typeof models !== "object") {
    return [];
  }
  const invalid: string[] = [];
  for (const key of Object.keys(models)) {
    if (key !== "providers" && key !== "mode") {
      invalid.push(`models.${key}`);
    }
  }
  return invalid;
}

function validateAgentsConfig(agents: OpenClawConfig["agents"]): string[] {
  if (!agents || typeof agents !== "object") {
    return [];
  }
  const invalid: string[] = [];
  for (const key of Object.keys(agents)) {
    if (key !== "defaults") {
      invalid.push(`agents.${key}`);
      continue;
    }
    const defaults = agents.defaults;
    if (!defaults || typeof defaults !== "object") {
      continue;
    }
    for (const subKey of Object.keys(defaults)) {
      if (subKey !== "models") {
        invalid.push(`agents.defaults.${subKey}`);
      }
    }
  }
  return invalid;
}
