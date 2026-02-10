import { loginOpenAICodex } from "@mariozechner/pi-ai";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { upsertAuthProfile } from "../agents/auth-profiles.js";
import { resolveEnvApiKey } from "../agents/model-auth.js";
import { upsertSharedEnvVar } from "../infra/env-file.js";
import { listProviderAuthChoices } from "../providers/registry.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import { applyDefaultModelChoice } from "./auth-choice.default-model.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "./auth-token.js";
import { isRemoteEnvironment } from "./oauth-env.js";
import { createVpsAwareOAuthHandlers } from "./oauth-flow.js";
import {
  applyAuthProfileConfig,
  setAnthropicApiKey,
  writeOAuthCredentials,
} from "./onboard-auth.js";
import { openUrl } from "./onboard-helpers.js";
import {
  applyOpenAICodexModelDefault,
  OPENAI_CODEX_DEFAULT_MODEL,
} from "./openai-codex-model-default.js";
import {
  applyOpenAIConfig,
  applyOpenAIProviderConfig,
  OPENAI_DEFAULT_MODEL,
} from "./openai-model-default.js";

type AuthChoiceHandler = (params: ApplyAuthChoiceParams) => Promise<ApplyAuthChoiceResult>;

const registryHandlers: Record<string, AuthChoiceHandler> = {
  "anthropic-setup-token": async (params) => {
    let nextConfig = params.config;
    await params.prompter.note(
      ["Run `claude setup-token` in your terminal.", "Then paste the generated token below."].join(
        "\n",
      ),
      "Anthropic setup-token",
    );

    const tokenRaw = await params.prompter.text({
      message: "Paste Anthropic setup-token",
      validate: (value) => validateAnthropicSetupToken(String(value ?? "")),
    });
    const token = String(tokenRaw).trim();

    const profileNameRaw = await params.prompter.text({
      message: "Token name (blank = default)",
      placeholder: "default",
    });
    const provider = "anthropic";
    const namedProfileId = buildTokenProfileId({
      provider,
      name: String(profileNameRaw ?? ""),
    });

    upsertAuthProfile({
      profileId: namedProfileId,
      agentDir: params.agentDir,
      credential: {
        type: "token",
        provider,
        token,
      },
    });

    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: namedProfileId,
      provider,
      mode: "token",
    });
    return { config: nextConfig };
  },
  "anthropic-api-key": async (params) => {
    let nextConfig = params.config;
    let hasCredential = false;
    const envKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (params.opts?.token) {
      await setAnthropicApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    if (!hasCredential && envKey) {
      const useExisting = await params.prompter.confirm({
        message: `Use existing ANTHROPIC_API_KEY (env, ${formatApiKeyPreview(envKey)})?`,
        initialValue: true,
      });
      if (useExisting) {
        await setAnthropicApiKey(envKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "Enter Anthropic API key",
        validate: validateApiKeyInput,
      });
      await setAnthropicApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "anthropic:default",
      provider: "anthropic",
      mode: "api_key",
    });
    return { config: nextConfig };
  },
  "openai-api-key": async (params) => {
    let nextConfig = params.config;
    let agentModelOverride: string | undefined;
    const noteAgentModel = async (model: string) => {
      if (!params.agentId) {
        return;
      }
      await params.prompter.note(
        `Default model set to ${model} for agent "${params.agentId}".`,
        "Model configured",
      );
    };

    const envKey = resolveEnvApiKey("openai");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `Use existing OPENAI_API_KEY (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
        initialValue: true,
      });
      if (useExisting) {
        const result = upsertSharedEnvVar({
          key: "OPENAI_API_KEY",
          value: envKey.apiKey,
        });
        if (!process.env.OPENAI_API_KEY) {
          process.env.OPENAI_API_KEY = envKey.apiKey;
        }
        await params.prompter.note(
          `Copied OPENAI_API_KEY to ${result.path} for launchd compatibility.`,
          "OpenAI API key",
        );
        const applied = await applyDefaultModelChoice({
          config: nextConfig,
          setDefaultModel: params.setDefaultModel,
          defaultModel: OPENAI_DEFAULT_MODEL,
          applyDefaultConfig: applyOpenAIConfig,
          applyProviderConfig: applyOpenAIProviderConfig,
          noteDefault: OPENAI_DEFAULT_MODEL,
          noteAgentModel,
          prompter: params.prompter,
        });
        nextConfig = applied.config;
        agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
        return { config: nextConfig, agentModelOverride };
      }
    }

    let key: string | undefined;
    if (params.opts?.token && params.opts?.tokenProvider === "openai") {
      key = params.opts.token;
    } else {
      key = await params.prompter.text({
        message: "Enter OpenAI API key",
        validate: validateApiKeyInput,
      });
    }

    const trimmed = normalizeApiKeyInput(String(key));
    const result = upsertSharedEnvVar({
      key: "OPENAI_API_KEY",
      value: trimmed,
    });
    process.env.OPENAI_API_KEY = trimmed;
    await params.prompter.note(
      `Saved OPENAI_API_KEY to ${result.path} for launchd compatibility.`,
      "OpenAI API key",
    );
    const applied = await applyDefaultModelChoice({
      config: nextConfig,
      setDefaultModel: params.setDefaultModel,
      defaultModel: OPENAI_DEFAULT_MODEL,
      applyDefaultConfig: applyOpenAIConfig,
      applyProviderConfig: applyOpenAIProviderConfig,
      noteDefault: OPENAI_DEFAULT_MODEL,
      noteAgentModel,
      prompter: params.prompter,
    });
    nextConfig = applied.config;
    agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    return { config: nextConfig, agentModelOverride };
  },
  "openai-codex-oauth": async (params) => {
    let nextConfig = params.config;
    let agentModelOverride: string | undefined;
    const noteAgentModel = async (model: string) => {
      if (!params.agentId) {
        return;
      }
      await params.prompter.note(
        `Default model set to ${model} for agent "${params.agentId}".`,
        "Model configured",
      );
    };

    const isRemote = isRemoteEnvironment();
    await params.prompter.note(
      isRemote
        ? [
            "You are running in a remote/VPS environment.",
            "A URL will be shown for you to open in your LOCAL browser.",
            "After signing in, paste the redirect URL back here.",
          ].join("\n")
        : [
            "Browser will open for OpenAI authentication.",
            "If the callback doesn't auto-complete, paste the redirect URL.",
            "OpenAI OAuth uses localhost:1455 for the callback.",
          ].join("\n"),
      "OpenAI Codex OAuth",
    );
    const spin = params.prompter.progress("Starting OAuth flow…");
    try {
      const { onAuth, onPrompt } = createVpsAwareOAuthHandlers({
        isRemote,
        prompter: params.prompter,
        runtime: params.runtime,
        spin,
        openUrl,
        localBrowserMessage: "Complete sign-in in browser…",
      });

      const creds = await loginOpenAICodex({
        onAuth,
        onPrompt,
        onProgress: (msg) => spin.update(msg),
      });
      spin.stop("OpenAI OAuth complete");
      if (creds) {
        await writeOAuthCredentials("openai-codex", creds, params.agentDir);
        nextConfig = applyAuthProfileConfig(nextConfig, {
          profileId: "openai-codex:default",
          provider: "openai-codex",
          mode: "oauth",
        });
        if (params.setDefaultModel) {
          const applied = applyOpenAICodexModelDefault(nextConfig);
          nextConfig = applied.next;
          if (applied.changed) {
            await params.prompter.note(
              `Default model set to ${OPENAI_CODEX_DEFAULT_MODEL}`,
              "Model configured",
            );
          }
        } else {
          agentModelOverride = OPENAI_CODEX_DEFAULT_MODEL;
          await noteAgentModel(OPENAI_CODEX_DEFAULT_MODEL);
        }
      }
    } catch (err) {
      spin.stop("OpenAI OAuth failed");
      params.runtime.error(String(err));
      await params.prompter.note(
        "Trouble with OAuth? See https://docs.openclaw.ai/start/faq",
        "OAuth help",
      );
    }
    return { config: nextConfig, agentModelOverride };
  },
};

function normalizeRegistryChoice(params: ApplyAuthChoiceParams): string {
  if (params.authChoice === "oauth" || params.authChoice === "setup-token") {
    return "token";
  }
  if (params.authChoice === "claude-cli") {
    return "token";
  }
  if (params.authChoice === "codex-cli") {
    return "openai-codex";
  }
  if (params.authChoice === "apiKey" && params.opts?.tokenProvider === "openai") {
    return "openai-api-key";
  }
  return params.authChoice;
}

export async function applyRegistryAuthChoice(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  const choice = normalizeRegistryChoice(params);
  const entry = listProviderAuthChoices().find((item) => item.choice === choice);
  if (!entry?.handlerId) {
    return null;
  }
  const handler = registryHandlers[entry.handlerId];
  if (!handler) {
    return null;
  }
  return handler(params);
}
