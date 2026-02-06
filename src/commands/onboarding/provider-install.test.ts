import { afterEach, describe, expect, it, vi } from "vitest";

const installPluginFromNpmSpec = vi.hoisted(() => vi.fn());
const loadPluginManifest = vi.hoisted(() => vi.fn());
const resolveDeclarativeProviderAuthSpecs = vi.hoisted(() =>
  vi.fn<() => Array<Record<string, unknown>>>(() => []),
);

vi.mock("../../plugins/install.js", () => ({
  installPluginFromNpmSpec,
}));

vi.mock("../../plugins/manifest.js", () => ({
  loadPluginManifest,
}));

vi.mock("../../plugins/provider-auth-manifest.js", () => ({
  resolveDeclarativeProviderAuthSpecs,
}));

describe("provider-install", () => {
  afterEach(() => {
    installPluginFromNpmSpec.mockReset();
    loadPluginManifest.mockReset();
    resolveDeclarativeProviderAuthSpecs.mockReset();
    resolveDeclarativeProviderAuthSpecs.mockReturnValue([]);
  });

  it("resolves installed provider auth choice from token provider", async () => {
    const { resolveInstalledCommunityProviderAuthChoice } = await import("./provider-install.js");

    const choice = resolveInstalledCommunityProviderAuthChoice({
      tokenProvider: "z-ai",
      authChoices: [
        {
          authChoice: "plugin-auth:zai-provider:zai:api-key",
          providerId: "zai",
          label: "Z.AI",
          pluginId: "zai-provider",
        },
      ],
    });

    expect(choice?.authChoice).toBe("plugin-auth:zai-provider:zai:api-key");
  });

  it("installs provider and returns declarative auth choices", async () => {
    installPluginFromNpmSpec.mockResolvedValue({
      ok: true,
      pluginId: "xai",
      targetDir: "/tmp/xai",
      version: "1.0.0",
      extensions: [],
    });
    loadPluginManifest.mockReturnValue({
      ok: true,
      manifest: {
        id: "xai-provider",
        name: "xAI (Grok)",
      },
    });
    resolveDeclarativeProviderAuthSpecs.mockReturnValue([
      {
        pluginId: "xai-provider",
        providerId: "xai",
        authChoice: "plugin-auth:xai-provider:xai:api-key",
        method: "api-key",
        label: "xAI (Grok)",
        hint: "API key",
      },
    ]);

    const { installCommunityProviderFromNpm } = await import("./provider-install.js");
    const result = await installCommunityProviderFromNpm({
      npmSpec: "@openclaw/xai",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pluginId).toBe("xai-provider");
      expect(result.authChoices).toHaveLength(1);
      expect(result.authChoices[0]?.authChoice).toBe("plugin-auth:xai-provider:xai:api-key");
    }
  });

  it("fails when installed plugin has no declarative provider auth", async () => {
    installPluginFromNpmSpec.mockResolvedValue({
      ok: true,
      pluginId: "noop",
      targetDir: "/tmp/noop",
      extensions: [],
    });
    loadPluginManifest.mockReturnValue({
      ok: true,
      manifest: {
        id: "noop-provider",
        name: "Noop",
      },
    });
    resolveDeclarativeProviderAuthSpecs.mockReturnValue([]);

    const { installCommunityProviderFromNpm } = await import("./provider-install.js");
    const result = await installCommunityProviderFromNpm({
      npmSpec: "@openclaw/noop",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("does not declare any API-key providerAuth entries");
    }
  });
});
