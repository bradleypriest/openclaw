import type { BuiltinOAuthRefreshHandler } from "./oauth-refresh-types.js";
import { normalizeProviderId } from "../../provider-id.js";

const oauthRefreshHandlers = new Map<string, BuiltinOAuthRefreshHandler>();

export function registerBuiltinOAuthRefreshHandlers(
  handlers: Array<{ providerId: string; handler: BuiltinOAuthRefreshHandler }>,
): void {
  for (const registration of handlers) {
    const providerId = normalizeProviderId(registration.providerId);
    if (!providerId || oauthRefreshHandlers.has(providerId)) {
      continue;
    }
    oauthRefreshHandlers.set(providerId, registration.handler);
  }
}

export function resolveBuiltinOAuthRefreshHandler(
  providerRaw: string,
): BuiltinOAuthRefreshHandler | undefined {
  return oauthRefreshHandlers.get(normalizeProviderId(providerRaw));
}
