import { describe, expect, it, vi } from "vitest";
import type { AuthProfileStore } from "../agents/auth-profiles.js";
import type { WizardPrompter } from "../wizard/prompts.js";

const buildAuthChoiceGroups = vi.hoisted(() =>
  vi.fn(() => ({
    groups: [
      {
        value: "openai",
        label: "OpenAI",
        options: [{ value: "openai-api-key", label: "OpenAI API key" }],
      },
    ],
    skipOption: { value: "skip", label: "Skip for now" },
  })),
);

const installCommunityProviderFromNpm = vi.hoisted(() => vi.fn());

vi.mock("./auth-choice-options.js", () => ({
  buildAuthChoiceGroups,
}));

vi.mock("./onboarding/provider-install.js", () => ({
  installCommunityProviderFromNpm,
}));

describe("promptAuthChoiceGrouped", () => {
  it("installs a community provider and returns its auth choice", async () => {
    installCommunityProviderFromNpm.mockResolvedValue({
      ok: true,
      npmSpec: "@openclaw/xai",
      pluginId: "xai-provider",
      pluginName: "xAI (Grok)",
      authChoices: [
        {
          authChoice: "plugin-auth:xai-provider:xai:api-key",
          providerId: "xai",
          label: "xAI (Grok)",
          hint: "API key",
          pluginId: "xai-provider",
        },
      ],
    });

    const select: WizardPrompter["select"] = vi.fn(async (params) => {
      if (params.message === "Model/auth provider") {
        return params.options.find((option) => option.label === "Install community provider...")
          ?.value as never;
      }
      return params.options[0]?.value as never;
    });
    const prompter: WizardPrompter = {
      intro: vi.fn(async () => {}),
      outro: vi.fn(async () => {}),
      note: vi.fn(async () => {}),
      select,
      multiselect: vi.fn(async () => []),
      text: vi.fn(async () => "@openclaw/xai"),
      confirm: vi.fn(async () => false),
      progress: vi.fn(() => ({ update: vi.fn(), stop: vi.fn() })),
    };

    const store: AuthProfileStore = { version: 1, profiles: {} };
    const { promptAuthChoiceGrouped } = await import("./auth-choice-prompt.js");

    const choice = await promptAuthChoiceGrouped({
      prompter,
      store,
      includeSkip: true,
      config: {},
    });

    expect(choice).toBe("plugin-auth:xai-provider:xai:api-key");
    expect(installCommunityProviderFromNpm).toHaveBeenCalledWith(
      expect.objectContaining({ npmSpec: "@openclaw/xai" }),
    );
  });
});
