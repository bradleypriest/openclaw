import { beforeEach, describe, expect, it } from "vitest";
import {
  listProviderRegistryDiagnostics,
  listProviders,
  registerProvider,
  registerPluginProvider,
  resolveProvider,
  resetProviderRegistryForTests,
} from "./registry.js";

describe("provider registry", () => {
  beforeEach(() => {
    resetProviderRegistryForTests();
  });

  it("registers and resolves providers", () => {
    registerProvider({ id: "OpenAI", label: "OpenAI" });
    const resolved = resolveProvider("openai");

    expect(resolved?.id).toBe("openai");
    expect(resolved?.label).toBe("OpenAI");
    expect(listProviders()).toHaveLength(1);
  });

  it("emits diagnostics for duplicate ids", () => {
    registerProvider({ id: "openai" });
    registerProvider({ id: "OpenAI", label: "Duplicate" });

    const diagnostics = listProviderRegistryDiagnostics();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.message).toContain("provider already registered: openai");
    expect(listProviders()).toHaveLength(1);
  });

  it("rejects disallowed configPatch keys", () => {
    registerProvider({
      id: "openai",
      configPatch: {
        models: { mode: "merge" },
        agents: { defaults: { models: { "openai/gpt-4": { alias: "GPT-4" } } } },
        channels: { slack: { enabled: true } },
      },
    });

    const diagnostics = listProviderRegistryDiagnostics();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.message).toContain("provider configPatch includes disallowed keys");

    const resolved = resolveProvider("openai");
    expect(resolved?.configPatch).toBeUndefined();
  });

  it("accepts allowed configPatch keys", () => {
    registerProvider({
      id: "openai",
      configPatch: {
        models: {
          mode: "merge",
          providers: {
            openai: {
              baseUrl: "https://api.openai.com/v1",
              api: "openai-completions",
              models: [],
            },
          },
        },
        agents: { defaults: { models: { "openai/gpt-4": { alias: "GPT-4" } } } },
      },
    });

    expect(listProviderRegistryDiagnostics()).toHaveLength(0);
    expect(resolveProvider("openai")?.configPatch).toBeDefined();
  });

  it("registers plugin providers via adapter", () => {
    registerPluginProvider({
      id: "acme",
      label: "AcmeAI",
      auth: [
        {
          id: "oauth",
          label: "OAuth",
          kind: "oauth",
          run: async () => ({ profiles: [] }),
        },
      ],
    });

    const resolved = resolveProvider("acme");
    expect(resolved?.id).toBe("acme");
    expect(resolved?.label).toBe("AcmeAI");
    expect(resolved?.auth).toHaveLength(1);
  });
});
