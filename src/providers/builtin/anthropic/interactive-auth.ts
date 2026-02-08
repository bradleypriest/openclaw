import type {
  ApplyAuthChoiceParams,
  ApplyAuthChoiceResult,
} from "../../../commands/auth-choice.apply.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "../../../commands/auth-choice.api-key.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "../../../commands/auth-token.js";
import { applyAuthProfileConfig, writeApiKeyCredential } from "../../../commands/onboard-auth.js";

export async function applyAuthChoiceAnthropic(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (
    params.authChoice === "setup-token" ||
    params.authChoice === "oauth" ||
    params.authChoice === "token"
  ) {
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
  }

  if (params.authChoice === "apiKey") {
    if (params.opts?.tokenProvider && params.opts.tokenProvider !== "anthropic") {
      return null;
    }

    let nextConfig = params.config;
    let hasCredential = false;
    const envKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (params.opts?.token) {
      await writeApiKeyCredential({
        providerId: "anthropic",
        profileId: "anthropic:default",
        key: normalizeApiKeyInput(params.opts.token),
        agentDir: params.agentDir,
      });
      hasCredential = true;
    }

    if (!hasCredential && envKey) {
      const useExisting = await params.prompter.confirm({
        message: `Use existing ANTHROPIC_API_KEY (env, ${formatApiKeyPreview(envKey)})?`,
        initialValue: true,
      });
      if (useExisting) {
        await writeApiKeyCredential({
          providerId: "anthropic",
          profileId: "anthropic:default",
          key: envKey,
          agentDir: params.agentDir,
        });
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "Enter Anthropic API key",
        validate: validateApiKeyInput,
      });
      await writeApiKeyCredential({
        providerId: "anthropic",
        profileId: "anthropic:default",
        key: normalizeApiKeyInput(String(key)),
        agentDir: params.agentDir,
      });
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "anthropic:default",
      provider: "anthropic",
      mode: "api_key",
    });
    return { config: nextConfig };
  }

  return null;
}
