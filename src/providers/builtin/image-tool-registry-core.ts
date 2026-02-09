import { normalizeProviderId } from "../provider-id.js";

export type ProviderVisionModelCandidate = {
  id?: string;
  input?: string[];
};

export type BuiltinPreferredVisionModelResolverContext = {
  provider: string;
  providerHasAuth: boolean;
  providerVisionFromConfig: string | null;
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
};

export type BuiltinPreferredVisionModelResolver = (
  params: BuiltinPreferredVisionModelResolverContext,
) => string | null;

export type BuiltinCrossProviderVisionModelResolver = (params: {
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}) => { primary: string; fallbacks?: string[] } | null;

export type BuiltinConfiguredVisionModelPicker = (
  models: ProviderVisionModelCandidate[],
) => ProviderVisionModelCandidate | undefined;

type BuiltinPreferredVisionModelResolverRegistration = {
  id: string;
  priority: number;
  resolve: BuiltinPreferredVisionModelResolver;
};

type BuiltinCrossProviderVisionModelResolverRegistration = {
  id: string;
  priority: number;
  resolve: BuiltinCrossProviderVisionModelResolver;
};

const preferredResolvers = new Map<string, BuiltinPreferredVisionModelResolverRegistration>();
const crossProviderResolvers = new Map<
  string,
  BuiltinCrossProviderVisionModelResolverRegistration
>();
const configuredVisionModelPickers = new Map<string, BuiltinConfiguredVisionModelPicker>();

function insertOrdered<T extends { id: string; priority: number }>(
  registrations: T[],
  registration: T,
): void {
  const index = registrations.findIndex(
    (entry) =>
      registration.priority < entry.priority ||
      (registration.priority === entry.priority && registration.id.localeCompare(entry.id) < 0),
  );
  if (index === -1) {
    registrations.push(registration);
    return;
  }
  registrations.splice(index, 0, registration);
}

function orderedPreferredResolvers(): BuiltinPreferredVisionModelResolverRegistration[] {
  const ordered: BuiltinPreferredVisionModelResolverRegistration[] = [];
  for (const registration of preferredResolvers.values()) {
    insertOrdered(ordered, registration);
  }
  return ordered;
}

function orderedCrossProviderResolvers(): BuiltinCrossProviderVisionModelResolverRegistration[] {
  const ordered: BuiltinCrossProviderVisionModelResolverRegistration[] = [];
  for (const registration of crossProviderResolvers.values()) {
    insertOrdered(ordered, registration);
  }
  return ordered;
}

export function registerBuiltinPreferredVisionModelResolvers(
  registrations: BuiltinPreferredVisionModelResolverRegistration[],
): void {
  for (const registration of registrations) {
    if (!registration.id.trim() || preferredResolvers.has(registration.id)) {
      continue;
    }
    preferredResolvers.set(registration.id, registration);
  }
}

export function registerBuiltinConfiguredVisionModelPickers(
  registrations: Array<{ providerId: string; pick: BuiltinConfiguredVisionModelPicker }>,
): void {
  for (const registration of registrations) {
    const providerId = normalizeProviderId(registration.providerId);
    if (!providerId || configuredVisionModelPickers.has(providerId)) {
      continue;
    }
    configuredVisionModelPickers.set(providerId, registration.pick);
  }
}

export function registerBuiltinCrossProviderVisionModelResolvers(
  registrations: BuiltinCrossProviderVisionModelResolverRegistration[],
): void {
  for (const registration of registrations) {
    if (!registration.id.trim() || crossProviderResolvers.has(registration.id)) {
      continue;
    }
    crossProviderResolvers.set(registration.id, registration);
  }
}

export function resolveBuiltinPreferredVisionModelViaRegistry(
  params: BuiltinPreferredVisionModelResolverContext,
): string | null {
  for (const registration of orderedPreferredResolvers()) {
    const preferred = registration.resolve(params)?.trim();
    if (preferred) {
      return preferred;
    }
  }
  return null;
}

export function pickConfiguredProviderVisionModelViaRegistry(params: {
  provider: string;
  models: ProviderVisionModelCandidate[];
}): ProviderVisionModelCandidate | undefined {
  const picker = configuredVisionModelPickers.get(normalizeProviderId(params.provider));
  if (picker) {
    const picked = picker(params.models);
    if (picked) {
      return picked;
    }
  }
  return params.models.find((model) => Boolean((model?.id ?? "").trim()) && hasImageInput(model));
}

export function resolveBuiltinCrossProviderVisionModelViaRegistry(params: {
  openAiHasAuth: boolean;
  anthropicHasAuth: boolean;
}): { primary: string; fallbacks?: string[] } | null {
  for (const registration of orderedCrossProviderResolvers()) {
    const result = registration.resolve(params);
    if (result?.primary?.trim()) {
      return result;
    }
  }
  return null;
}

function hasImageInput(model: ProviderVisionModelCandidate | undefined): boolean {
  return Array.isArray(model?.input) && model.input.includes("image");
}
