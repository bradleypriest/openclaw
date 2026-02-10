import type { OpenClawConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, OnboardOptions } from "../../onboard-types.js";
import { upsertAuthProfile } from "../../../agents/auth-profiles.js";
import { normalizeProviderId } from "../../../agents/model-selection.js";
import { parseDurationMs } from "../../../cli/parse-duration.js";
import { upsertSharedEnvVar } from "../../../infra/env-file.js";
import {
  listProviderAuthChoices,
  resolveProviderEnvVarCandidates,
} from "../../../providers/registry.js";
import { shortenHomePath } from "../../../utils.js";
import { normalizeSecretInput } from "../../../utils/normalize-secret-input.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "../../auth-token.js";
import { applyAuthProfileConfig, setAnthropicApiKey } from "../../onboard-auth.js";
import { applyOpenAIConfig } from "../../openai-model-default.js";
import { resolveNonInteractiveApiKey } from "../api-keys.js";

type RegistryAuthChoiceParams = {
  nextConfig: OpenClawConfig;
  authChoice: AuthChoice;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
};

type RegistryAuthChoiceHandler = (
  params: RegistryAuthChoiceParams,
) => Promise<OpenClawConfig | null>;

const registryHandlers: Record<string, RegistryAuthChoiceHandler> = {
  "anthropic-setup-token": async (params) => {
    const { authChoice, opts, runtime } = params;
    if (authChoice !== "token") {
      return null;
    }
    const providerRaw = opts.tokenProvider?.trim();
    if (!providerRaw) {
      runtime.error("Missing --token-provider for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const provider = normalizeProviderId(providerRaw);
    if (provider !== "anthropic") {
      runtime.error("Only --token-provider anthropic is supported for --auth-choice token.");
      runtime.exit(1);
      return null;
    }
    const tokenRaw = normalizeSecretInput(opts.token);
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
    return applyAuthProfileConfig(params.nextConfig, {
      profileId,
      provider,
      mode: "token",
    });
  },
  "anthropic-api-key": async (params) => {
    const { authChoice, opts, runtime, baseConfig } = params;
    if (authChoice !== "apiKey") {
      return null;
    }
    if (opts.tokenProvider && opts.tokenProvider !== "anthropic") {
      runtime.error("Only --token-provider anthropic is supported for --auth-choice apiKey.");
      runtime.exit(1);
      return null;
    }
    const anthropicEnvVar =
      resolveProviderEnvVarCandidates("anthropic").find((envVar) => envVar.includes("API_KEY")) ??
      "ANTHROPIC_API_KEY";
    const resolved = await resolveNonInteractiveApiKey({
      provider: "anthropic",
      cfg: baseConfig,
      flagValue: opts.anthropicApiKey,
      flagName: "--anthropic-api-key",
      envVar: anthropicEnvVar,
      runtime,
    });
    if (!resolved) {
      return null;
    }
    if (resolved.source !== "profile") {
      await setAnthropicApiKey(resolved.key);
    }
    return applyAuthProfileConfig(params.nextConfig, {
      profileId: "anthropic:default",
      provider: "anthropic",
      mode: "api_key",
    });
  },
  "openai-api-key": async (params) => {
    const { authChoice, opts, runtime, baseConfig } = params;
    if (authChoice !== "openai-api-key") {
      return null;
    }
    const openaiEnvVar = resolveProviderEnvVarCandidates("openai")[0] ?? "OPENAI_API_KEY";
    const resolved = await resolveNonInteractiveApiKey({
      provider: "openai",
      cfg: baseConfig,
      flagValue: opts.openaiApiKey,
      flagName: "--openai-api-key",
      envVar: openaiEnvVar,
      runtime,
      allowProfile: false,
    });
    if (!resolved) {
      return null;
    }
    const key = resolved.key;
    const result = upsertSharedEnvVar({ key: "OPENAI_API_KEY", value: key });
    process.env.OPENAI_API_KEY = key;
    runtime.log(`Saved OPENAI_API_KEY to ${shortenHomePath(result.path)}`);
    return applyOpenAIConfig(params.nextConfig);
  },
};

export async function applyNonInteractiveRegistryAuthChoice(
  params: RegistryAuthChoiceParams,
): Promise<OpenClawConfig | null> {
  const entry = listProviderAuthChoices().find((item) => item.choice === params.authChoice);
  if (!entry?.handlerId) {
    return null;
  }
  const handler = registryHandlers[entry.handlerId];
  if (!handler) {
    return null;
  }
  return handler(params);
}
