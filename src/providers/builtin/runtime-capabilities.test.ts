import { describe, expect, it } from "vitest";
import { isCacheTtlEligibleProvider } from "./runtime-capabilities.js";

describe("isCacheTtlEligibleProvider", () => {
  it("returns true for cache-ttl eligible providers", () => {
    expect(
      isCacheTtlEligibleProvider({
        provider: "anthropic",
        modelId: "claude-opus-4-5",
      }),
    ).toBe(true);
  });

  it("delegates conditional eligibility to provider hook", () => {
    expect(
      isCacheTtlEligibleProvider({
        provider: "openrouter",
        modelId: "anthropic/claude-sonnet-4-5",
      }),
    ).toBe(true);

    expect(
      isCacheTtlEligibleProvider({
        provider: "openrouter",
        modelId: "openai/gpt-5",
      }),
    ).toBe(false);
  });

  it("returns false for providers without cache-ttl capability", () => {
    expect(
      isCacheTtlEligibleProvider({
        provider: "google",
        modelId: "gemini-2.5-pro",
      }),
    ).toBe(false);
  });
});
