import { describe, expect, it } from "vitest";
import {
  isAntigravityClaudeModel,
  isCacheTtlEligibleProvider,
  isGoogleModelApi,
  resolveProviderThoughtSignatureSanitizationPolicy,
} from "./runtime-capabilities.js";

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

describe("isAntigravityClaudeModel", () => {
  it("delegates model matching via provider hook", () => {
    expect(
      isAntigravityClaudeModel({
        provider: "google-antigravity",
        modelId: "claude-3-7-sonnet",
      }),
    ).toBe(true);

    expect(
      isAntigravityClaudeModel({
        provider: "google-antigravity",
        modelId: "gemini-2.5-pro",
      }),
    ).toBe(false);
  });
});

describe("resolveProviderThoughtSignatureSanitizationPolicy", () => {
  it("delegates policy resolution via provider hook", () => {
    expect(
      resolveProviderThoughtSignatureSanitizationPolicy({
        provider: "openrouter",
        modelId: "google/gemini-2.5-pro",
      }),
    ).toEqual({ allowBase64Only: true, includeCamelCase: true });

    expect(
      resolveProviderThoughtSignatureSanitizationPolicy({
        provider: "openrouter",
        modelId: "anthropic/claude-sonnet-4-5",
      }),
    ).toBeUndefined();
  });
});

describe("isGoogleModelApi", () => {
  it("resolves google model APIs via registry tags", () => {
    expect(isGoogleModelApi("google-generative-ai")).toBe(true);
    expect(isGoogleModelApi("openai-responses")).toBe(false);
  });
});
