import { normalizeProviderId } from "../../provider-id.js";

export const LEGACY_ANTHROPIC_DEFAULT_PROFILE_ID = "anthropic:default";
const LEGACY_CLAUDE_CLI_PROFILE_ID = "anthropic:claude-cli";
const LEGACY_CODEX_CLI_PROFILE_ID = "openai-codex:codex-cli";

export function supportsLegacyDefaultOAuthProfile(provider: string): boolean {
  return normalizeProviderId(provider) === "anthropic";
}

export function isDeprecatedClaudeCliProfile(params: {
  provider: string;
  profileId: string;
}): boolean {
  return (
    normalizeProviderId(params.provider) === "anthropic" &&
    params.profileId === LEGACY_CLAUDE_CLI_PROFILE_ID
  );
}

export function isDeprecatedCodexCliProfile(params: {
  provider: string;
  profileId: string;
}): boolean {
  return (
    normalizeProviderId(params.provider) === "openai-codex" &&
    params.profileId === LEGACY_CODEX_CLI_PROFILE_ID
  );
}
