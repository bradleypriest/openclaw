import type { OAuthCredential } from "../../../agents/auth-profiles/types.js";
import type {
  BuiltinOAuthRefreshHandler,
  BuiltinOAuthRefreshResult,
} from "./oauth-refresh-types.js";
import { normalizeProviderId } from "../../provider-id.js";
import { refreshChutesOAuthCredential } from "../chutes/oauth-refresh.js";
import { refreshQwenPortalOAuthCredential } from "../qwen-portal/oauth-refresh.js";

const BUILTIN_OAUTH_REFRESH_HANDLERS: Record<string, BuiltinOAuthRefreshHandler> = {
  chutes: refreshChutesOAuthCredential,
  "qwen-portal": refreshQwenPortalOAuthCredential,
};

export async function refreshBuiltinOAuthCredentials(
  credential: OAuthCredential,
): Promise<BuiltinOAuthRefreshResult | null> {
  const provider = normalizeProviderId(credential.provider);
  const refreshHandler = BUILTIN_OAUTH_REFRESH_HANDLERS[provider];
  if (!refreshHandler) {
    return null;
  }
  return await refreshHandler(credential);
}
