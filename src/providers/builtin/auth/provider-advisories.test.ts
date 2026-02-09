import { describe, expect, it } from "vitest";
import type { AuthProfileStore } from "../../../agents/auth-profiles.js";
import {
  resolveMissingProviderAuthHint,
  resolveProviderMissingApiKeyError,
  resolveProviderModelConfigWarning,
} from "./provider-advisories.js";

function createStore(): AuthProfileStore {
  return {
    version: 1,
    profiles: {
      "openai-codex:default": {
        type: "oauth",
        provider: "openai-codex",
        access: "test",
        refresh: "refresh",
        expires: Date.now() + 3600_000,
      },
    },
  };
}

describe("provider advisories registry", () => {
  it("resolves OpenAI advisories through provider handlers", () => {
    const store = createStore();
    expect(resolveProviderMissingApiKeyError("openai", store)).toContain("No API key found");
    expect(resolveProviderModelConfigWarning("openai", store)).toContain(
      "Detected OpenAI Codex OAuth",
    );
  });

  it("resolves Anthropic auth hint through provider handlers", () => {
    expect(resolveMissingProviderAuthHint("anthropic")).toContain("claude setup-token");
  });
});
