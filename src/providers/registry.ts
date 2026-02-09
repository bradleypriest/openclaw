import type { OpenClawConfig } from "../config/config.js";
import type { ProviderAuthMethod } from "../plugins/types.js";
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

  providerRegistry.set(id, { ...provider, id });
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
