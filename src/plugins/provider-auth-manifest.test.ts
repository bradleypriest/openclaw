import { afterEach, describe, expect, it, vi } from "vitest";

const loadPluginManifestRegistry = vi.hoisted(() =>
  vi.fn<() => { plugins: Array<Record<string, unknown>>; diagnostics: unknown[] }>(() => ({
    plugins: [],
    diagnostics: [],
  })),
);

vi.mock("./manifest-registry.js", () => ({
  loadPluginManifestRegistry,
}));

describe("provider-auth-manifest", () => {
  afterEach(() => {
    vi.resetModules();
    loadPluginManifestRegistry.mockReset();
    loadPluginManifestRegistry.mockReturnValue({ plugins: [], diagnostics: [] });
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

    vi.resetModules();
    const { resolveDeclarativeProviderAuthSpecs } = await import("./provider-auth-manifest.js");
    const specs = resolveDeclarativeProviderAuthSpecs();

    expect(specs).toHaveLength(1);
    expect(specs[0]).toMatchObject({
      pluginId: "xai-provider",
      providerId: "xai",
      authChoice: "plugin-auth:xai-provider:xai:api-key",
      method: "api-key",
      label: "xAI (Grok)",
      hint: "API key",
      envVars: ["XAI_API_KEY"],
      defaultModel: "xai/grok-2-latest",
      profileId: "xai:default",
      keyPrompt: "Enter xAI API key",
    });
  });

  it("matches providers by normalized token-provider id", async () => {
    loadPluginManifestRegistry.mockReturnValue({
      plugins: [
        {
          id: "zai-provider",
          providerAuth: {
            zai: {
              method: "api-key",
              authChoice: "plugin-auth:zai-provider:zai:api-key",
              label: "Z.AI",
            },
          },
        },
      ],
      diagnostics: [],
    });

    vi.resetModules();
    const { findDeclarativeProviderAuthByTokenProvider } =
      await import("./provider-auth-manifest.js");
    const spec = findDeclarativeProviderAuthByTokenProvider("z-ai");

    expect(spec?.providerId).toBe("zai");
    expect(spec?.authChoice).toBe("plugin-auth:zai-provider:zai:api-key");
  });
});
