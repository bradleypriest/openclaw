import { LEGACY_ANTHROPIC_DEFAULT_PROFILE_ID } from "../anthropic/legacy-profiles.js";
import { ensureBuiltinLegacyProfileRulesRegistered } from "./legacy-profile-registry-bootstrap.js";
import { resolveBuiltinLegacyProfileRules } from "./legacy-profile-registry-core.js";

export { LEGACY_ANTHROPIC_DEFAULT_PROFILE_ID };

export function resolveLegacyDefaultOAuthProfileId(provider: string): string | undefined {
  ensureBuiltinLegacyProfileRulesRegistered();
  return resolveBuiltinLegacyProfileRules(provider)?.defaultOAuthProfileId;
}

export function supportsLegacyDefaultOAuthProfile(provider: string): boolean {
  return Boolean(resolveLegacyDefaultOAuthProfileId(provider));
}

export function isDeprecatedClaudeCliProfile(params: {
  provider: string;
  profileId: string;
}): boolean {
  ensureBuiltinLegacyProfileRulesRegistered();
  return (
    resolveBuiltinLegacyProfileRules(params.provider)?.deprecatedProfileIds?.includes(
      params.profileId,
    ) ?? false
  );
}

export function isDeprecatedCodexCliProfile(params: {
  provider: string;
  profileId: string;
}): boolean {
  ensureBuiltinLegacyProfileRulesRegistered();
  return (
    resolveBuiltinLegacyProfileRules(params.provider)?.deprecatedProfileIds?.includes(
      params.profileId,
    ) ?? false
  );
}
