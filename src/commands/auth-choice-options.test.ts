import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthProfileStore } from "../agents/auth-profiles.js";
import { buildAuthChoiceOptions } from "./auth-choice-options.js";

const resolveDeclarativeProviderAuthSpecs = vi.hoisted(() =>
  vi.fn<() => Array<Record<string, unknown>>>(() => []),
);
vi.mock("../plugins/provider-auth-manifest.js", () => ({
  resolveDeclarativeProviderAuthSpecs,
}));

describe("buildAuthChoiceOptions", () => {
  afterEach(() => {
    resolveDeclarativeProviderAuthSpecs.mockReset();
    resolveDeclarativeProviderAuthSpecs.mockReturnValue([]);
  });

  it("includes GitHub Copilot", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.find((opt) => opt.value === "github-copilot")).toBeDefined();
  });
  it("includes setup-token option for Anthropic", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "token")).toBe(true);
  });

  it("includes Z.AI (GLM) auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "zai-api-key")).toBe(true);
  });

  it("includes Xiaomi auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "xiaomi-api-key")).toBe(true);
  });

  it("includes MiniMax auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "minimax-api")).toBe(true);
    expect(options.some((opt) => opt.value === "minimax-api-lightning")).toBe(true);
  });

  it("includes Moonshot auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "moonshot-api-key")).toBe(true);
    expect(options.some((opt) => opt.value === "moonshot-api-key-cn")).toBe(true);
    expect(options.some((opt) => opt.value === "kimi-code-api-key")).toBe(true);
  });

  it("includes Vercel AI Gateway auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "ai-gateway-api-key")).toBe(true);
  });

  it("includes Cloudflare AI Gateway auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "cloudflare-ai-gateway-api-key")).toBe(true);
  });

  it("includes Synthetic auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "synthetic-api-key")).toBe(true);
  });

  it("includes Chutes OAuth auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "chutes")).toBe(true);
  });

  it("includes Qwen auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "qwen-portal")).toBe(true);
  });

  it("includes xAI auth choice", () => {
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "xai-api-key")).toBe(true);
  });

  it("includes declarative plugin API-key auth choices", () => {
    resolveDeclarativeProviderAuthSpecs.mockReturnValue([
      {
        pluginId: "xai-provider",
        providerId: "xai",
        authChoice: "plugin:xai-provider:xai:api-key",
        method: "api-key",
        label: "xAI (Grok)",
        hint: "API key",
        groupId: "xai",
        groupLabel: "xAI (Grok)",
        envVars: ["XAI_API_KEY"],
        profileId: "xai:default",
        keyPrompt: "Enter xAI API key",
      },
    ]);

    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    expect(options.some((opt) => opt.value === "plugin:xai-provider:xai:api-key")).toBe(true);
  });
});
