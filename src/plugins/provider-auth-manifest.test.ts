import { afterEach, describe, expect, it, vi } from "vitest";

const loadPluginManifestRegistry = vi.hoisted(() =>
  vi.fn<() => { plugins: Array<Record<string, unknown>>; diagnostics: unknown[] }>(() => ({
    plugins: [],
    diagnostics: [],
  })),
);

const resolvePluginProviderRegistrations = vi.hoisted(() =>
  vi.fn<
    () => Array<{
      pluginId: string;
      provider: { id: string; label?: string; auth: Array<Record<string, unknown>> };
    }>
  >(() => []),
);

vi.mock("./manifest-registry.js", () => ({
  loadPluginManifestRegistry,
}));

vi.mock("./providers.js", () => ({
  resolvePluginProviderRegistrations,
}));

describe("provider-auth-manifest", () => {
  afterEach(() => {
    vi.resetModules();
    loadPluginManifestRegistry.mockReset();
    loadPluginManifestRegistry.mockReturnValue({ plugins: [], diagnostics: [] });
    resolvePluginProviderRegistrations.mockReset();
    resolvePluginProviderRegistrations.mockReturnValue([]);
  });

  it("derives declarative API-key auth specs from plugin manifests", async () => {
    loadPluginManifestRegistry.mockReturnValue({
      plugins: [
        {
          id: "xai-provider",
          providerAuth: {
            xai: {
              method: "api-key",
              label: "xAI (Grok)",
              hint: "API key",
              envVars: ["XAI_API_KEY"],
              defaultModel: "xai/grok-2-latest",
              profileId: "xai:default",
              keyPrompt: "Enter xAI API key",
            },
          },
        },
      ],
      diagnostics: [],
    });
    resolvePluginProviderRegistrations.mockReturnValue([
      {
        pluginId: "xai-provider",
        provider: {
          id: "xai",
          label: "xAI (Grok)",
          auth: [
            {
              id: "api-key",
              label: "xAI (Grok)",
              kind: "api_key",
              run: vi.fn(),
            },
          ],
        },
      },
    ]);

    vi.resetModules();
    const { resolveDeclarativeProviderAuthSpecs } = await import("./provider-auth-manifest.js");
    const specs = resolveDeclarativeProviderAuthSpecs();

    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({
      pluginId: "xai-provider",
      providerId: "xai",
      authChoice: "plugin:xai-provider:xai:api-key",
      method: "api-key",
      label: "xAI (Grok)",
      hint: "API key",
      envVars: ["XAI_API_KEY"],
      defaultModel: "xai/grok-2-latest",
      profileId: "xai:default",
      keyPrompt: "Enter xAI API key",
    });
  });

  it("does not create auth specs from manifest-only providerAuth entries", async () => {
    loadPluginManifestRegistry.mockReturnValue({
      plugins: [
        {
          id: "manifest-only-provider",
          providerAuth: {
            xai: {
              method: "api-key",
              label: "xAI (Grok)",
              envVars: ["XAI_API_KEY"],
            },
          },
        },
      ],
      diagnostics: [],
    });
    resolvePluginProviderRegistrations.mockReturnValue([]);

    vi.resetModules();
    const { resolveDeclarativeProviderAuthSpecs } = await import("./provider-auth-manifest.js");
    const specs = resolveDeclarativeProviderAuthSpecs();

    expect(specs).toHaveLength(0);
  });

  it("matches providers by normalized token-provider id", async () => {
    loadPluginManifestRegistry.mockReturnValue({
      plugins: [
        {
          id: "zai-provider",
          providerAuth: {
            zai: {
              method: "api-key",
              authChoice: "plugin:zai-provider:zai:api-key",
              label: "Z.AI",
            },
          },
        },
      ],
      diagnostics: [],
    });
    resolvePluginProviderRegistrations.mockReturnValue([
      {
        pluginId: "zai-provider",
        provider: {
          id: "zai",
          label: "Z.AI",
          auth: [
            {
              id: "api-key",
              label: "Z.AI",
              authChoice: "plugin:zai-provider:zai:api-key",
              kind: "api_key",
              run: vi.fn(),
            },
          ],
        },
      },
    ]);

    vi.resetModules();
    const { findDeclarativeProviderAuthByTokenProvider } =
      await import("./provider-auth-manifest.js");
    const spec = findDeclarativeProviderAuthByTokenProvider("z-ai");

    expect(spec?.providerId).toBe("zai");
    expect(spec?.authChoice).toBe("plugin:zai-provider:zai:api-key");
  });
});
