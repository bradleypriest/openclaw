import { normalizeProviderId } from "./provider-id.js";

export type ProviderModelIdNormalizer = (model: string) => string;

const providerModelIdNormalizers = new Map<string, ProviderModelIdNormalizer>();

export function registerProviderModelIdNormalizer(
  providerId: string,
  normalizeModelId: ProviderModelIdNormalizer,
): void {
  const normalized = normalizeProviderId(providerId);
  if (!normalized) {
    throw new Error("Provider id is required for model id normalizer");
  }
  if (providerModelIdNormalizers.has(normalized)) {
    return;
  }
  providerModelIdNormalizers.set(normalized, normalizeModelId);
}

export function normalizeModelIdForProvider(provider: string, model: string): string {
  const normalized = normalizeProviderId(provider);
  const normalizer = providerModelIdNormalizers.get(normalized);
  if (!normalizer) {
    return model;
  }
  return normalizer(model);
}
