import type { OAuthCredential } from "../../../agents/auth-profiles/types.js";
import type { BuiltinOAuthRefreshResult } from "./oauth-refresh-types.js";
import { ensureBuiltinOAuthRefreshHandlersRegistered } from "./oauth-refresh-registry-bootstrap.js";
import { resolveBuiltinOAuthRefreshHandler } from "./oauth-refresh-registry-core.js";

export async function refreshBuiltinOAuthCredentials(
  credential: OAuthCredential,
): Promise<BuiltinOAuthRefreshResult | null> {
  ensureBuiltinOAuthRefreshHandlersRegistered();
  const refreshHandler = resolveBuiltinOAuthRefreshHandler(credential.provider);
  if (!refreshHandler) {
    return null;
  }
  return await refreshHandler(credential);
}
