import type { AuthProfileStore } from "../agents/auth-profiles.js";
import type { OpenClawConfig } from "../config/config.js";
import type { AuthChoice } from "./onboard-types.js";
import { resolveDeclarativeProviderAuthSpecs } from "../plugins/provider-auth-manifest.js";
import {
  listBuiltinAuthChoiceCatalogEntries,
  type BuiltinAuthChoiceCatalogEntry,
} from "../providers/builtin/auth/choice-catalog.js";

export type AuthChoiceOption = {
  value: AuthChoice;
  label: string;
  hint?: string;
};

export type AuthChoiceGroupId = string & {};

export type AuthChoiceGroup = {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  options: AuthChoiceOption[];
};

type ResolvedAuthChoiceGroupDef = {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  choices: AuthChoice[];
};

function listSelectableBuiltinAuthChoices(): BuiltinAuthChoiceCatalogEntry[] {
  return listBuiltinAuthChoiceCatalogEntries().filter((entry) => entry.selectable !== false);
}

function resolveAuthChoiceGroupDefs(params: {
  config?: OpenClawConfig;
  workspaceDir?: string;
}): ResolvedAuthChoiceGroupDef[] {
  const defs: ResolvedAuthChoiceGroupDef[] = [];
  const groupIndex = new Map<string, number>();

  for (const entry of listSelectableBuiltinAuthChoices()) {
    const index = groupIndex.get(entry.groupId);
    if (index === undefined) {
      defs.push({
        value: entry.groupId,
        label: entry.groupLabel,
        hint: entry.groupHint,
        choices: [entry.choice],
      });
      groupIndex.set(entry.groupId, defs.length - 1);
      continue;
    }
    defs[index].choices.push(entry.choice);
  }

  const pluginOptions = resolveDeclarativeProviderAuthSpecs({
    config: params.config,
    workspaceDir: params.workspaceDir,
  }).filter((entry) => entry.method === "api-key");

  for (const option of pluginOptions) {
    const choice = option.authChoice as AuthChoice;
    const index = groupIndex.get(option.groupId);
    if (index === undefined) {
      defs.push({
        value: option.groupId,
        label: option.groupLabel,
        hint: option.groupHint,
        choices: [choice],
      });
      groupIndex.set(option.groupId, defs.length - 1);
      continue;
    }
    const group = defs[index];
    if (!group.choices.includes(choice)) {
      group.choices.push(choice);
    }
    if (!group.hint && option.groupHint) {
      group.hint = option.groupHint;
    }
  }

  return defs;
}

export function buildAuthChoiceOptions(params: {
  store: AuthProfileStore;
  includeSkip: boolean;
  config?: OpenClawConfig;
  workspaceDir?: string;
}): AuthChoiceOption[] {
  void params.store;

  const options: AuthChoiceOption[] = [];
  const values = new Set<AuthChoice>();
  for (const entry of listSelectableBuiltinAuthChoices()) {
    if (values.has(entry.choice)) {
      continue;
    }
    options.push({
      value: entry.choice,
      label: entry.label,
      hint: entry.hint,
    });
    values.add(entry.choice);
  }

  const pluginOptions = resolveDeclarativeProviderAuthSpecs({
    config: params.config,
    workspaceDir: params.workspaceDir,
  }).filter((entry) => entry.method === "api-key");
  for (const option of pluginOptions) {
    const value = option.authChoice as AuthChoice;
    if (values.has(value)) {
      continue;
    }
    options.push({ value, label: option.label, hint: option.hint });
    values.add(value);
  }

  if (params.includeSkip) {
    options.push({ value: "skip", label: "Skip for now" });
  }

  return options;
}

export function buildAuthChoiceGroups(params: {
  store: AuthProfileStore;
  includeSkip: boolean;
  config?: OpenClawConfig;
  workspaceDir?: string;
}): {
  groups: AuthChoiceGroup[];
  skipOption?: AuthChoiceOption;
} {
  const options = buildAuthChoiceOptions({
    ...params,
    includeSkip: false,
  });
  const optionByValue = new Map<AuthChoice, AuthChoiceOption>(
    options.map((opt) => [opt.value, opt]),
  );

  const groupDefs = resolveAuthChoiceGroupDefs({
    config: params.config,
    workspaceDir: params.workspaceDir,
  });

  const groups = groupDefs
    .map((group) => ({
      ...group,
      options: group.choices
        .map((choice) => optionByValue.get(choice))
        .filter((opt): opt is AuthChoiceOption => Boolean(opt)),
    }))
    .filter((group) => group.options.length > 0);

  const skipOption = params.includeSkip
    ? ({ value: "skip", label: "Skip for now" } satisfies AuthChoiceOption)
    : undefined;

  return { groups, skipOption };
}
