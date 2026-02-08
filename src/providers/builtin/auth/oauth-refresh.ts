import type { OAuthCredential } from "../../../agents/auth-profiles/types.js";
import { normalizeProviderId } from "../../provider-id.js";
import { refreshQwenPortalCredentials } from "../../qwen-portal-oauth.js";
import { refreshChutesTokens } from "../chutes/oauth.js";

type BuiltinOAuthRefreshResult = {
  apiKey: string;
  newCredentials: OAuthCredential;
};

export async function refreshBuiltinOAuthCredentials(
  credential: OAuthCredential,
): Promise<BuiltinOAuthRefreshResult | null> {
  const provider = normalizeProviderId(credential.provider);

  if (provider === "chutes") {
    const newCredentials = await refreshChutesTokens({ credential });
    return {
      apiKey: newCredentials.access,
      newCredentials: {
        ...credential,
        ...newCredentials,
        type: "oauth",
        provider: credential.provider,
      },
    };
  }

  if (provider === "qwen-portal") {
    const newCredentials = await refreshQwenPortalCredentials(credential);
    return {
      apiKey: newCredentials.access,
      newCredentials: {
        ...credential,
        ...newCredentials,
        type: "oauth",
        provider: credential.provider,
      },
    };
  }

  return null;
}
