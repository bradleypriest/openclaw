import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { resolveOpenClawAgentDir } from "../agents/agent-paths.js";
import { upsertAuthProfile } from "../agents/auth-profiles.js";
import { normalizeProviderId } from "../agents/model-selection.js";
export { CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF } from "../agents/cloudflare-ai-gateway.js";
export { XAI_DEFAULT_MODEL_REF } from "./onboard-auth.models.js";

const resolveAuthAgentDir = (agentDir?: string) => agentDir ?? resolveOpenClawAgentDir();

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
    agentDir: resolveAuthAgentDir(agentDir),
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
    agentDir: resolveAuthAgentDir(params.agentDir),
  });
}

export const ZAI_DEFAULT_MODEL_REF = "zai/glm-4.7";
export const XIAOMI_DEFAULT_MODEL_REF = "xiaomi/mimo-v2-flash";
export const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";
export const VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF = "vercel-ai-gateway/anthropic/claude-opus-4.6";
