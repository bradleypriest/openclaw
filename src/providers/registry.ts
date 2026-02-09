import type { OpenClawConfig } from "../config/config.js";
import type { ProviderAuthMethod, ProviderPlugin } from "../plugins/types.js";
import { normalizeProviderId } from "../agents/model-selection.js";

export type ProviderRegistryDiagnostic = {
  level: "error" | "warn";
  message: string;
  providerId?: string;
};

export type ProviderRegistration = {
  id: string;
  label?: string;
  aliases?: string[];
  auth?: ProviderAuthMethod[];
  defaultModel?: string;
  configPatch?: Partial<OpenClawConfig>;
};

export function registerPluginProvider(provider: ProviderPlugin): void {
  registerProvider({
    id: provider.id,
    label: provider.label,
    aliases: provider.aliases,
    auth: provider.auth,
  });
}

const providerRegistry = new Map<string, ProviderRegistration>();
const providerDiagnostics: ProviderRegistryDiagnostic[] = [];

function pushDiagnostic(diagnostic: ProviderRegistryDiagnostic): void {
  providerDiagnostics.push(diagnostic);
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

  const { configPatch, invalidConfigPatchKeys } = validateConfigPatch(provider.configPatch);
  if (invalidConfigPatchKeys.length > 0) {
    pushDiagnostic({
      level: "error",
      message: `provider configPatch includes disallowed keys: ${invalidConfigPatchKeys.join(", ")}`,
      providerId: id,
    });
  }

  providerRegistry.set(id, { ...provider, id, configPatch });
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
