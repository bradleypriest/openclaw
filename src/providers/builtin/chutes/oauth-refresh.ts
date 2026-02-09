import type { OAuthCredential } from "../../../agents/auth-profiles/types.js";
import type { BuiltinOAuthRefreshResult } from "../auth/oauth-refresh-types.js";
import { refreshChutesTokens } from "./oauth.js";

export async function refreshChutesOAuthCredential(
  credential: OAuthCredential,
): Promise<BuiltinOAuthRefreshResult> {
  const refreshed = await refreshChutesTokens({ credential });
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
