import { describe, expect, it } from "vitest";
import {
  isDeprecatedClaudeCliProfile,
  isDeprecatedCodexCliProfile,
  resolveLegacyDefaultOAuthProfileId,
  supportsLegacyDefaultOAuthProfile,
} from "./legacy-profiles.js";

describe("legacy profile rules", () => {
  it("resolves provider default oauth profile id via registry", () => {
    expect(resolveLegacyDefaultOAuthProfileId("anthropic")).toBe("anthropic:default");
    expect(resolveLegacyDefaultOAuthProfileId("openai")).toBeUndefined();
  });

  it("detects deprecated provider-specific profile IDs", () => {
    expect(
      isDeprecatedClaudeCliProfile({
        provider: "anthropic",
        profileId: "anthropic:claude-cli",
      }),
    ).toBe(true);
    expect(
      isDeprecatedCodexCliProfile({
        provider: "openai-codex",
        profileId: "openai-codex:codex-cli",
      }),
    ).toBe(true);
  });

  it("exposes legacy default oauth support by provider", () => {
    expect(supportsLegacyDefaultOAuthProfile("anthropic")).toBe(true);
    expect(supportsLegacyDefaultOAuthProfile("openai-codex")).toBe(false);
  });
});
