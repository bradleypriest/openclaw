import type { Api, Model } from "@mariozechner/pi-ai";
import { normalizeProviderId } from "../providers/provider-id.js";

export type ProviderImageModelExecutionHandler = (params: {
  model: Model<Api>;
  apiKey: string;
  prompt: string;
  imageDataUrl: string;
}) => Promise<string>;

const providerImageModelExecutionHandlers = new Map<string, ProviderImageModelExecutionHandler>();

export function registerProviderImageModelExecutionHandlers(
  handlers: Array<{ providerId: string; execute: ProviderImageModelExecutionHandler }>,
): void {
  for (const registration of handlers) {
    const providerId = normalizeProviderId(registration.providerId);
    if (!providerId || providerImageModelExecutionHandlers.has(providerId)) {
      continue;
    }
    providerImageModelExecutionHandlers.set(providerId, registration.execute);
  }
}

export function resolveProviderImageModelExecutionHandler(
  providerRaw: string,
): ProviderImageModelExecutionHandler | undefined {
  return providerImageModelExecutionHandlers.get(normalizeProviderId(providerRaw));
}
