import type { OAuthCredential } from "../../../agents/auth-profiles/types.js";

export type BuiltinOAuthRefreshResult = {
  apiKey: string;
  newCredentials: OAuthCredential;
};

export type BuiltinOAuthRefreshHandler = (
  credential: OAuthCredential,
) => Promise<BuiltinOAuthRefreshResult>;
