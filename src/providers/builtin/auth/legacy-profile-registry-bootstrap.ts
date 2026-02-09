import {
  LEGACY_ANTHROPIC_DEFAULT_PROFILE_ID,
  LEGACY_CLAUDE_CLI_PROFILE_ID,
} from "../anthropic/legacy-profiles.js";
import { LEGACY_CODEX_CLI_PROFILE_ID } from "../openai/legacy-profiles.js";
import { registerBuiltinLegacyProfileRules } from "./legacy-profile-registry-core.js";

let registered = false;

export function ensureBuiltinLegacyProfileRulesRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinLegacyProfileRules([
    {
      providerId: "anthropic",
      rules: {
        defaultOAuthProfileId: LEGACY_ANTHROPIC_DEFAULT_PROFILE_ID,
        deprecatedProfileIds: [LEGACY_CLAUDE_CLI_PROFILE_ID],
      },
    },
    {
      providerId: "openai-codex",
      rules: {
        deprecatedProfileIds: [LEGACY_CODEX_CLI_PROFILE_ID],
      },
    },
  ]);

  registered = true;
}
