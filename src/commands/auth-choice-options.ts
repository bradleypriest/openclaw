import type { AuthProfileStore } from "../agents/auth-profiles.js";
import type { AuthChoice } from "./onboard-types.js";
import { listProviderAuthChoices } from "../providers/registry.js";

export type AuthChoiceOption = {
  value: AuthChoice;
  label: string;
  hint?: string;
};

export type AuthChoiceGroupId =
  | "openai"
  | "anthropic"
  | "google"
  | "copilot"
  | "openrouter"
  | "ai-gateway"
  | "cloudflare-ai-gateway"
  | "moonshot"
  | "zai"
  | "xiaomi"
  | "opencode-zen"
  | "minimax"
  | "synthetic"
  | "venice"
  | "qwen"
  | "qianfan"
  | "xai";

export type AuthChoiceGroup = {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  options: AuthChoiceOption[];
};

const AUTH_CHOICE_GROUP_DEFS: {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  choices: AuthChoice[];
}[] = [
  {
    value: "openai",
    label: "OpenAI",
    hint: "Codex OAuth + API key",
    choices: [],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    hint: "setup-token + API key",
    choices: [],
  },
  {
    value: "minimax",
    label: "MiniMax",
    hint: "M2.1 (recommended)",
    choices: ["minimax-portal", "minimax-api", "minimax-api-lightning"],
  },
  {
    value: "moonshot",
    label: "Moonshot AI (Kimi K2.5)",
    hint: "Kimi K2.5 + Kimi Coding",
    choices: ["moonshot-api-key", "moonshot-api-key-cn", "kimi-code-api-key"],
  },
  {
    value: "google",
    label: "Google",
    hint: "Gemini API key + OAuth",
    choices: ["gemini-api-key", "google-antigravity", "google-gemini-cli"],
  },
  {
    value: "xai",
    label: "xAI (Grok)",
    hint: "API key",
    choices: ["xai-api-key"],
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    hint: "API key",
    choices: ["openrouter-api-key"],
  },
  {
    value: "qwen",
    label: "Qwen",
    hint: "OAuth",
    choices: ["qwen-portal"],
  },
  {
    value: "zai",
    label: "Z.AI (GLM 4.7)",
    hint: "API key",
    choices: ["zai-api-key"],
  },
  {
    value: "qianfan",
    label: "Qianfan",
    hint: "API key",
    choices: ["qianfan-api-key"],
  },
  {
    value: "copilot",
    label: "Copilot",
    hint: "GitHub + local proxy",
    choices: ["github-copilot", "copilot-proxy"],
  },
  {
    value: "ai-gateway",
    label: "Vercel AI Gateway",
    hint: "API key",
    choices: ["ai-gateway-api-key"],
  },
  {
    value: "opencode-zen",
    label: "OpenCode Zen",
    hint: "API key",
    choices: ["opencode-zen"],
  },
  {
    value: "xiaomi",
    label: "Xiaomi",
    hint: "API key",
    choices: ["xiaomi-api-key"],
  },
  {
    value: "synthetic",
    label: "Synthetic",
    hint: "Anthropic-compatible (multi-model)",
    choices: ["synthetic-api-key"],
  },
  {
    value: "venice",
    label: "Venice AI",
    hint: "Privacy-focused (uncensored models)",
    choices: ["venice-api-key"],
  },
  {
    value: "cloudflare-ai-gateway",
    label: "Cloudflare AI Gateway",
    hint: "Account ID + Gateway ID + API key",
    choices: ["cloudflare-ai-gateway-api-key"],
  },
];

export function buildAuthChoiceOptions(params: {
  store: AuthProfileStore;
  includeSkip: boolean;
}): AuthChoiceOption[] {
  void params.store;
  const options: AuthChoiceOption[] = [];
  const registryEntries = listProviderAuthChoices();
  const groupOrder = new Map<string, number>(
    AUTH_CHOICE_GROUP_DEFS.map((def, index) => [def.value, index]),
  );
  const knownGroups = new Set(groupOrder.keys());
  const seen = new Set<AuthChoice>();
  const pushOption = (option: AuthChoiceOption) => {
    if (seen.has(option.value)) {
      return;
    }
    options.push(option);
    seen.add(option.value);
  };

  const prioritizedRegistry = registryEntries
    .filter((entry) => knownGroups.has(entry.groupId))
    .filter((entry) => entry.selectable !== false)
    .toSorted((a, b) => {
      const groupA = groupOrder.get(a.groupId) ?? Number.MAX_SAFE_INTEGER;
      const groupB = groupOrder.get(b.groupId) ?? Number.MAX_SAFE_INTEGER;
      if (groupA !== groupB) {
        return groupA - groupB;
      }
      return a.label.localeCompare(b.label);
    });
  for (const entry of prioritizedRegistry) {
    pushOption({
      value: entry.choice as AuthChoice,
      label: entry.label,
      hint: entry.hint,
    });
  }

  pushOption({ value: "chutes", label: "Chutes (OAuth)" });
  pushOption({ value: "xai-api-key", label: "xAI (Grok) API key" });
  pushOption({
    value: "qianfan-api-key",
    label: "Qianfan API key",
  });
  pushOption({ value: "openrouter-api-key", label: "OpenRouter API key" });
  pushOption({
    value: "ai-gateway-api-key",
    label: "Vercel AI Gateway API key",
  });
  pushOption({
    value: "cloudflare-ai-gateway-api-key",
    label: "Cloudflare AI Gateway",
    hint: "Account ID + Gateway ID + API key",
  });
  pushOption({
    value: "moonshot-api-key",
    label: "Kimi API key (.ai)",
  });
  pushOption({
    value: "moonshot-api-key-cn",
    label: "Kimi API key (.cn)",
  });
  pushOption({
    value: "kimi-code-api-key",
    label: "Kimi Code API key (subscription)",
  });
  pushOption({ value: "synthetic-api-key", label: "Synthetic API key" });
  pushOption({
    value: "venice-api-key",
    label: "Venice AI API key",
    hint: "Privacy-focused inference (uncensored models)",
  });
  pushOption({
    value: "github-copilot",
    label: "GitHub Copilot (GitHub device login)",
    hint: "Uses GitHub device flow",
  });
  pushOption({ value: "gemini-api-key", label: "Google Gemini API key" });
  pushOption({
    value: "google-antigravity",
    label: "Google Antigravity OAuth",
    hint: "Uses the bundled Antigravity auth plugin",
  });
  pushOption({
    value: "google-gemini-cli",
    label: "Google Gemini CLI OAuth",
    hint: "Uses the bundled Gemini CLI auth plugin",
  });
  pushOption({ value: "zai-api-key", label: "Z.AI (GLM 4.7) API key" });
  pushOption({
    value: "xiaomi-api-key",
    label: "Xiaomi API key",
  });
  pushOption({
    value: "minimax-portal",
    label: "MiniMax OAuth",
    hint: "Oauth plugin for MiniMax",
  });
  pushOption({ value: "qwen-portal", label: "Qwen OAuth" });
  pushOption({
    value: "copilot-proxy",
    label: "Copilot Proxy (local)",
    hint: "Local proxy for VS Code Copilot models",
  });
  pushOption({ value: "apiKey", label: "Anthropic API key" });
  // Token flow is currently Anthropic-only; use CLI for advanced providers.
  pushOption({
    value: "opencode-zen",
    label: "OpenCode Zen (multi-model proxy)",
    hint: "Claude, GPT, Gemini via opencode.ai/zen",
  });
  pushOption({ value: "minimax-api", label: "MiniMax M2.1" });
  pushOption({
    value: "minimax-api-lightning",
    label: "MiniMax M2.1 Lightning",
    hint: "Faster, higher output cost",
  });
  if (params.includeSkip) {
    pushOption({ value: "skip", label: "Skip for now" });
  }

  for (const entry of registryEntries) {
    if (entry.selectable === false) {
      continue;
    }
    const value = entry.choice as AuthChoice;
    if (seen.has(value)) {
      continue;
    }
    pushOption({ value, label: entry.label, hint: entry.hint });
  }

  return options;
}

export function buildAuthChoiceGroups(params: { store: AuthProfileStore; includeSkip: boolean }): {
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
  const registryByGroup = new Map<string, ReturnType<typeof listProviderAuthChoices>>();
  for (const entry of listProviderAuthChoices()) {
    const list = registryByGroup.get(entry.groupId) ?? [];
    list.push(entry);
    registryByGroup.set(entry.groupId, list);
  }

  const groups = AUTH_CHOICE_GROUP_DEFS.map((group) => ({
    ...group,
    options: (() => {
      const merged = [
        ...group.choices
          .map((choice) => optionByValue.get(choice))
          .filter((opt): opt is AuthChoiceOption => Boolean(opt)),
        ...(registryByGroup.get(group.value) ?? [])
          .filter((entry) => entry.selectable !== false)
          .map((entry) => optionByValue.get(entry.choice as AuthChoice))
          .filter((opt): opt is AuthChoiceOption => Boolean(opt)),
      ];
      const deduped = new Map<AuthChoice, AuthChoiceOption>();
      for (const opt of merged) {
        if (!deduped.has(opt.value)) {
          deduped.set(opt.value, opt);
        }
      }
      return [...deduped.values()];
    })(),
  }));

  const skipOption = params.includeSkip
    ? ({ value: "skip", label: "Skip for now" } satisfies AuthChoiceOption)
    : undefined;

  return { groups, skipOption };
}
