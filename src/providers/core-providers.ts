import { registerProvider } from "./registry.js";

const OPENAI_GROUP = {
  groupId: "openai",
  groupLabel: "OpenAI",
  groupHint: "Codex OAuth + API key",
};

const ANTHROPIC_GROUP = {
  groupId: "anthropic",
  groupLabel: "Anthropic",
  groupHint: "setup-token + API key",
};

export function registerCoreProviders(): void {
  registerProvider({
    id: "openai",
    label: "OpenAI",
    internal: {
      authSignals: {
        envVarCandidates: ["OPENAI_API_KEY"],
      },
    },
    authChoices: [
      {
        choice: "openai-api-key",
        providerId: "openai",
        label: "OpenAI API key",
        handlerId: "openai-api-key",
        ...OPENAI_GROUP,
      },
    ],
  });

  registerProvider({
    id: "openai-codex",
    label: "OpenAI Codex",
    authChoices: [
      {
        choice: "openai-codex",
        providerId: "openai-codex",
        label: "OpenAI Codex (ChatGPT OAuth)",
        handlerId: "openai-codex-oauth",
        ...OPENAI_GROUP,
      },
    ],
  });

  registerProvider({
    id: "anthropic",
    label: "Anthropic",
    internal: {
      authSignals: {
        envVarCandidates: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
      },
    },
    authChoices: [
      {
        choice: "token",
        providerId: "anthropic",
        label: "Anthropic token (paste setup-token)",
        hint: "run `claude setup-token` elsewhere, then paste the token here",
        handlerId: "anthropic-setup-token",
        ...ANTHROPIC_GROUP,
      },
      {
        choice: "apiKey",
        providerId: "anthropic",
        label: "Anthropic API key",
        handlerId: "anthropic-api-key",
        ...ANTHROPIC_GROUP,
      },
    ],
  });
}
