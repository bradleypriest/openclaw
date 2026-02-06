import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const installCommunityProviderFromNpm = vi.hoisted(() => vi.fn());
const resolveInstalledCommunityProviderAuthChoice = vi.hoisted(() => vi.fn());
const findDeclarativeProviderAuthByChoice = vi.hoisted(() => vi.fn());
const findDeclarativeProviderAuthByTokenProvider = vi.hoisted(() => vi.fn());

vi.mock("./onboarding/provider-install.js", () => ({
  installCommunityProviderFromNpm,
  resolveInstalledCommunityProviderAuthChoice,
}));

vi.mock("../plugins/provider-auth-manifest.js", () => ({
  findDeclarativeProviderAuthByChoice,
  findDeclarativeProviderAuthByTokenProvider,
}));

describe("onboard (non-interactive): install-provider", () => {
  afterEach(() => {
    installCommunityProviderFromNpm.mockReset();
    resolveInstalledCommunityProviderAuthChoice.mockReset();
    findDeclarativeProviderAuthByChoice.mockReset();
    findDeclarativeProviderAuthByTokenProvider.mockReset();
  });

  it("installs provider package and applies declarative plugin auth from --token", async () => {
    const prev = {
      home: process.env.HOME,
      stateDir: process.env.OPENCLAW_STATE_DIR,
      configPath: process.env.OPENCLAW_CONFIG_PATH,
      skipChannels: process.env.OPENCLAW_SKIP_CHANNELS,
      skipGmail: process.env.OPENCLAW_SKIP_GMAIL_WATCHER,
      skipCron: process.env.OPENCLAW_SKIP_CRON,
      skipCanvas: process.env.OPENCLAW_SKIP_CANVAS_HOST,
      token: process.env.OPENCLAW_GATEWAY_TOKEN,
      password: process.env.OPENCLAW_GATEWAY_PASSWORD,
    };

    process.env.OPENCLAW_SKIP_CHANNELS = "1";
    process.env.OPENCLAW_SKIP_GMAIL_WATCHER = "1";
    process.env.OPENCLAW_SKIP_CRON = "1";
    process.env.OPENCLAW_SKIP_CANVAS_HOST = "1";
    delete process.env.OPENCLAW_GATEWAY_TOKEN;
    delete process.env.OPENCLAW_GATEWAY_PASSWORD;

    const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-onboard-install-provider-"));
    process.env.HOME = tempHome;
    process.env.OPENCLAW_STATE_DIR = tempHome;
    process.env.OPENCLAW_CONFIG_PATH = path.join(tempHome, "openclaw.json");

    const pluginDir = path.join(tempHome, "extensions", "community-xai");
    await fs.mkdir(pluginDir, { recursive: true });
    await fs.writeFile(
      path.join(pluginDir, "package.json"),
      JSON.stringify(
        {
          name: "community-xai",
          version: "1.0.0",
          openclaw: {
            extensions: ["index.js"],
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(path.join(pluginDir, "index.js"), "export default {};\n", "utf8");
    await fs.writeFile(
      path.join(pluginDir, "openclaw.plugin.json"),
      JSON.stringify(
        {
          id: "community-xai",
          name: "Community xAI",
          configSchema: {
            type: "object",
            additionalProperties: false,
            properties: {},
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    installCommunityProviderFromNpm.mockResolvedValue({
      ok: true,
      npmSpec: "@openclaw/xai",
      pluginId: "community-xai",
      pluginName: "xAI (Grok)",
      authChoices: [
        {
          authChoice: "plugin-auth:community-xai:xai:api-key",
          providerId: "xai",
          label: "xAI (Grok)",
          pluginId: "community-xai",
        },
      ],
    });
    resolveInstalledCommunityProviderAuthChoice.mockReturnValue({
      authChoice: "plugin-auth:community-xai:xai:api-key",
      providerId: "xai",
      label: "xAI (Grok)",
      pluginId: "community-xai",
    });
    findDeclarativeProviderAuthByChoice.mockImplementation((choice: string) =>
      choice === "plugin-auth:community-xai:xai:api-key"
        ? {
            pluginId: "community-xai",
            providerId: "xai",
            authChoice: "plugin-auth:community-xai:xai:api-key",
            method: "api-key",
            label: "xAI (Grok)",
            envVars: ["XAI_API_KEY"],
            defaultModel: "xai/grok-2-latest",
            profileId: "xai:default",
            keyPrompt: "Enter xAI API key",
          }
        : undefined,
    );
    findDeclarativeProviderAuthByTokenProvider.mockReturnValue(undefined);
    vi.resetModules();

    const runtime = {
      log: () => {},
      error: (msg: string) => {
        throw new Error(msg);
      },
      exit: (code: number) => {
        throw new Error(`exit:${code}`);
      },
    };

    try {
      const { runNonInteractiveOnboarding } = await import("./onboard-non-interactive.js");
      await runNonInteractiveOnboarding(
        {
          nonInteractive: true,
          provider: "@openclaw/xai:xai",
          apiKey: "xai-inline-token",
          skipHealth: true,
          skipChannels: true,
          skipSkills: true,
          json: true,
        },
        runtime,
      );

      expect(installCommunityProviderFromNpm).toHaveBeenCalledWith(
        expect.objectContaining({ npmSpec: "@openclaw/xai" }),
      );

      const { CONFIG_PATH } = await import("../config/config.js");
      const cfg = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8")) as {
        auth?: {
          profiles?: Record<string, { provider?: string; mode?: string }>;
        };
        agents?: { defaults?: { model?: { primary?: string } } };
        plugins?: {
          entries?: Record<string, { enabled?: boolean }>;
        };
      };

      expect(cfg.auth?.profiles?.["xai:default"]?.provider).toBe("xai");
      expect(cfg.auth?.profiles?.["xai:default"]?.mode).toBe("api_key");
      expect(cfg.agents?.defaults?.model?.primary).toBe("xai/grok-2-latest");
      expect(cfg.plugins?.entries?.["community-xai"]?.enabled).toBe(true);

      const { ensureAuthProfileStore } = await import("../agents/auth-profiles.js");
      const store = ensureAuthProfileStore();
      const profile = store.profiles["xai:default"];
      expect(profile?.type).toBe("api_key");
      if (profile?.type === "api_key") {
        expect(profile.provider).toBe("xai");
        expect(profile.key).toBe("xai-inline-token");
      }
    } finally {
      await fs.rm(tempHome, { recursive: true, force: true });
      process.env.HOME = prev.home;
      process.env.OPENCLAW_STATE_DIR = prev.stateDir;
      process.env.OPENCLAW_CONFIG_PATH = prev.configPath;
      process.env.OPENCLAW_SKIP_CHANNELS = prev.skipChannels;
      process.env.OPENCLAW_SKIP_GMAIL_WATCHER = prev.skipGmail;
      process.env.OPENCLAW_SKIP_CRON = prev.skipCron;
      process.env.OPENCLAW_SKIP_CANVAS_HOST = prev.skipCanvas;
      process.env.OPENCLAW_GATEWAY_TOKEN = prev.token;
      process.env.OPENCLAW_GATEWAY_PASSWORD = prev.password;
    }
  }, 60_000);
});
