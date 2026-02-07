import { afterEach, describe, expect, it, vi } from "vitest";

const resolvePluginProviderRegistrations = vi.hoisted(() =>
  vi.fn<
    () => Array<{
      pluginId: string;
      provider: { id: string; label?: string; auth: Array<Record<string, unknown>> };
    }>
  >(() => []),
);

vi.mock("./providers.js", () => ({
  resolvePluginProviderRegistrations,
}));

describe("provider-auth-manifest", () => {
  afterEach(() => {
    vi.resetModules();
    resolvePluginProviderRegistrations.mockReset();
    resolvePluginProviderRegistrations.mockReturnValue([]);
  });

  it("derives declarative auth specs from registered provider methods", async () => {
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
              hint: "API key",
              onboarding: {
                envVars: ["XAI_API_KEY"],
                defaultModel: "xai/grok-2-latest",
                profileId: "xai:default",
                keyPrompt: "Enter xAI API key",
                group: "xai",
                groupLabel: "xAI (Grok)",
              },
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

  it("supports legacy top-level onboarding fields for compatibility", async () => {
    resolvePluginProviderRegistrations.mockReturnValue([
      {
        pluginId: "legacy-provider",
        provider: {
          id: "legacy",
          label: "Legacy Provider",
          auth: [
            {
              id: "api-key",
              label: "Legacy API key",
              kind: "api_key",
              authChoice: "plugin:legacy-provider:legacy:api-key",
              envVars: ["LEGACY_API_KEY"],
              profileId: "legacy:default",
              keyPrompt: "Enter Legacy API key",
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
      providerId: "legacy",
      authChoice: "plugin:legacy-provider:legacy:api-key",
      envVars: ["LEGACY_API_KEY"],
      profileId: "legacy:default",
      keyPrompt: "Enter Legacy API key",
    });
  });

  it("matches providers by normalized token-provider id", async () => {
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
