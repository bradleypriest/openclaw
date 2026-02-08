import type { OpenClawConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, BuiltinOnboardOptions } from "../auth/onboard-types.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { parseDurationMs } from "../../../cli/parse-duration.js";
import { normalizeProviderId } from "../../provider-id.js";
import { writeApiKeyCredential } from "../auth/credentials-store.js";
import { applyAuthProfileConfig } from "../auth/profile-config.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "../auth/token-profile.js";
import { resolveNonInteractiveApiKey } from "../non-interactive/api-key-resolver.js";

export async function applyAnthropicNonInteractiveAuthChoice(params: {
  authChoice: AuthChoice;
  opts: BuiltinOnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
  nextConfig: OpenClawConfig;
}): Promise<OpenClawConfig | null | undefined> {
  const { authChoice, opts, runtime, baseConfig } = params;
  const nextConfig = params.nextConfig;

  if (authChoice === "claude-cli" || authChoice === "codex-cli") {
    runtime.error(
      [
        `Auth choice "${authChoice}" is deprecated.`,
        'Use "--auth-choice token" (Anthropic setup-token) or "--auth-choice openai-codex".',
      ].join("\n"),
    );
    runtime.exit(1);
    return null;
  }

  if (authChoice === "setup-token") {
    runtime.error(
      [
        'Auth choice "setup-token" requires interactive mode.',
        'Use "--auth-choice token" with --token and --provider anthropic.',
      ].join("\n"),
    );
    runtime.exit(1);
    return null;
  }

  if (authChoice === "apiKey") {
    const provider = opts.provider?.trim();
    if (provider && normalizeProviderId(provider) !== "anthropic") {
      return undefined;
    }

    const resolved = await resolveNonInteractiveApiKey({
      provider: "anthropic",
      cfg: baseConfig,
      flagValue: opts.anthropicApiKey,
      flagName: "--anthropic-api-key",
      envVar: "ANTHROPIC_API_KEY",
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await writeApiKeyCredential({
        providerId: "anthropic",
        profileId: "anthropic:default",
        key: resolved.key,
      });
    }
    return applyAuthProfileConfig(nextConfig, {
      profileId: "anthropic:default",
      provider: "anthropic",
      mode: "api_key",
    });
  }

  if (authChoice === "token") {
    const providerRaw = opts.provider?.trim();
    if (!providerRaw) {
      runtime.error("Missing --provider for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const provider = normalizeProviderId(providerRaw);
    if (provider !== "anthropic") {
      runtime.error("Only --provider anthropic is supported for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const tokenRaw = opts.token?.trim();
    if (!tokenRaw) {
      runtime.error("Missing --token for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const tokenError = validateAnthropicSetupToken(tokenRaw);
    if (tokenError) {
      runtime.error(tokenError);
      runtime.exit(1);
      return null;
    }

    let expires: number | undefined;
    const expiresInRaw = opts.tokenExpiresIn?.trim();
    if (expiresInRaw) {
      try {
        expires = Date.now() + parseDurationMs(expiresInRaw, { defaultUnit: "d" });
      } catch (err) {
        runtime.error(`Invalid --token-expires-in: ${String(err)}`);
        runtime.exit(1);
        return null;
      }
    }

    const profileId = opts.tokenProfileId?.trim() || buildTokenProfileId({ provider, name: "" });
    upsertAuthProfile({
      profileId,
      credential: {
        type: "token",
        provider,
        token: tokenRaw.trim(),
        ...(expires ? { expires } : {}),
      },
    });
    return applyAuthProfileConfig(nextConfig, {
      profileId,
      provider,
      mode: "token",
    });
  }

  return undefined;
}
