import type { OAuthCredential } from "../../../agents/auth-profiles/types.js";
import type { BuiltinOAuthRefreshResult } from "../auth/oauth-refresh-types.js";
import { refreshQwenPortalCredentials } from "./oauth.js";

export async function refreshQwenPortalOAuthCredential(
  credential: OAuthCredential,
): Promise<BuiltinOAuthRefreshResult> {
  const refreshed = await refreshQwenPortalCredentials(credential);
  return {
    apiKey: refreshed.access,
    newCredentials: {
      ...credential,
      ...refreshed,
      type: "oauth",
      provider: credential.provider,
    },
  };
}
