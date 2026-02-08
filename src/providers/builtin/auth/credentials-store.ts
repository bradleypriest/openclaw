import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { normalizeProviderId } from "../../provider-id.js";

export async function writeOAuthCredentials(
  provider: string,
  creds: OAuthCredentials,
  agentDir?: string,
): Promise<void> {
  const email =
    typeof creds.email === "string" && creds.email.trim() ? creds.email.trim() : "default";
  upsertAuthProfile({
    profileId: `${provider}:${email}`,
    credential: {
      type: "oauth",
      provider,
      ...creds,
    },
    agentDir,
  });
}

type ApiKeyCredentialWriteParams = {
  providerId: string;
  key: string;
  profileId?: string;
  metadata?: Record<string, string | undefined>;
  agentDir?: string;
};

function normalizeMetadata(
  metadata: Record<string, string | undefined> | undefined,
): Record<string, string> | undefined {
  if (!metadata) {
    return undefined;
  }

  const entries = Object.entries(metadata)
    .map(([key, value]) => [key.trim(), value?.trim() ?? ""] as const)
    .filter(([key, value]) => key.length > 0 && value.length > 0);
  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

export async function writeApiKeyCredential(params: ApiKeyCredentialWriteParams) {
  const providerId = normalizeProviderId(params.providerId);
  const profileId = params.profileId?.trim() || `${providerId}:default`;
  const metadata = normalizeMetadata(params.metadata);
  upsertAuthProfile({
    profileId,
    credential: {
      type: "api_key",
      provider: providerId,
      key: params.key.trim(),
      ...(metadata ? { metadata } : {}),
    },
    agentDir: params.agentDir,
  });
}
