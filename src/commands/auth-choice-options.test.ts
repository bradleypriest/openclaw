import { beforeEach, describe, expect, it } from "vitest";
import type { AuthProfileStore } from "../agents/auth-profiles.js";
import { registerProvider, resetProviderRegistryForTests } from "../providers/registry.js";
import { buildAuthChoiceGroups, buildAuthChoiceOptions } from "./auth-choice-options.js";

describe("buildAuthChoiceOptions", () => {
  beforeEach(() => {
    resetProviderRegistryForTests();
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

  it("includes registry auth choices", () => {
    registerProvider({
      id: "acme",
      authChoices: [
        {
          choice: "acme-auth",
          providerId: "acme",
          label: "Acme Auth",
          groupId: "openai",
          groupLabel: "OpenAI",
        },
      ],
    });
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const options = buildAuthChoiceOptions({
      store,
      includeSkip: false,
    });

    const values = options.map((opt) => String(opt.value));
    expect(values).toContain("acme-auth");
  });

  it("groups registry auth choices", () => {
    registerProvider({
      id: "acme",
      authChoices: [
        {
          choice: "acme-auth",
          providerId: "acme",
          label: "Acme Auth",
          groupId: "openai",
          groupLabel: "OpenAI",
        },
      ],
    });
    const store: AuthProfileStore = { version: 1, profiles: {} };
    const { groups } = buildAuthChoiceGroups({
      store,
      includeSkip: false,
    });

    const openaiGroup = groups.find((group) => group.value === "openai");
    const values = openaiGroup?.options.map((opt) => String(opt.value)) ?? [];
    expect(values).toContain("acme-auth");
  });
});
