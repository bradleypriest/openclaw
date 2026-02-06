import type { AuthProfileStore } from "../agents/auth-profiles.js";
import type { OpenClawConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import type { AuthChoice } from "./onboard-types.js";
import { buildAuthChoiceGroups } from "./auth-choice-options.js";
import { installCommunityProviderFromNpm } from "./onboarding/provider-install.js";

const BACK_VALUE = "__back";
const INSTALL_COMMUNITY_PROVIDER_VALUE = "__install-community-provider";

export async function promptAuthChoiceGrouped(params: {
  prompter: WizardPrompter;
  store: AuthProfileStore;
  includeSkip: boolean;
  config?: OpenClawConfig;
  workspaceDir?: string;
}): Promise<AuthChoice> {
  while (true) {
    const { groups, skipOption } = buildAuthChoiceGroups(params);
    const availableGroups = groups.filter((group) => group.options.length > 0);
    const providerOptions: Array<{ value: string; label: string; hint?: string }> = [
      ...availableGroups.map((group) => ({
        value: group.value,
        label: group.label,
        hint: group.hint,
      })),
      {
        value: INSTALL_COMMUNITY_PROVIDER_VALUE,
        label: "Install community provider...",
      },
      ...(skipOption ? [skipOption] : []),
    ];

    const providerSelection = await params.prompter.select<string>({
      message: "Model/auth provider",
      options: providerOptions,
    });

    if (providerSelection === "skip") {
      return "skip";
    }

    if (providerSelection === INSTALL_COMMUNITY_PROVIDER_VALUE) {
      const npmSpec = (
        await params.prompter.text({
          message: "Enter npm package name",
          validate: (value) => (value.trim() ? undefined : "Package name is required"),
        })
      ).trim();

      const progress = params.prompter.progress(`Installing ${npmSpec}...`);
      const installResult = await installCommunityProviderFromNpm({
        npmSpec,
        config: params.config,
        workspaceDir: params.workspaceDir,
        logger: {
          info: (message) => progress.update(message),
          warn: (message) => progress.update(message),
        },
      });

      if (!installResult.ok) {
        progress.stop();
        await params.prompter.note(
          `Failed to install ${npmSpec}: ${installResult.error}`,
          "Community provider",
        );
        continue;
      }

      progress.stop(`Installed ${installResult.npmSpec}`);
      const labels = installResult.authChoices.map((choice) => choice.label).join(", ");
      await params.prompter.note(`Found: ${labels}`, "Community provider");

      if (installResult.authChoices.length === 1) {
        return installResult.authChoices[0].authChoice as AuthChoice;
      }

      const selectedAuthChoice = await params.prompter.select<string>({
        message: `${installResult.pluginName} auth method`,
        options: installResult.authChoices.map((choice) => ({
          value: choice.authChoice,
          label: choice.label,
          hint: choice.hint,
        })),
      });
      return selectedAuthChoice as AuthChoice;
    }

    const group = availableGroups.find((candidate) => candidate.value === providerSelection);

    if (!group || group.options.length === 0) {
      await params.prompter.note(
        "No auth methods available for that provider.",
        "Model/auth choice",
      );
      continue;
    }

    const methodSelection = await params.prompter.select({
      message: `${group.label} auth method`,
      options: [...group.options, { value: BACK_VALUE, label: "Back" }],
    });

    if (methodSelection === BACK_VALUE) {
      continue;
    }

    return methodSelection as AuthChoice;
  }
}
