import type { OpenClawConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { AuthChoice, BuiltinOnboardOptions } from "../auth/onboard-types.js";
import { upsertSharedEnvVar } from "../../../infra/env-file.js";
import { shortenHomePath } from "../../../utils.js";
import { resolveNonInteractiveApiKey } from "../non-interactive/api-key-resolver.js";
import { applyOpenAIConfig } from "./default-model.js";

export async function applyOpenAINonInteractiveAuthChoice(params: {
  authChoice: AuthChoice;
  opts: BuiltinOnboardOptions;
  runtime: RuntimeEnv;
  baseConfig: OpenClawConfig;
  nextConfig: OpenClawConfig;
}): Promise<OpenClawConfig | null | undefined> {
  if (params.authChoice !== "openai-api-key") {
    return undefined;
  }

  const resolved = await resolveNonInteractiveApiKey({
    provider: "openai",
    cfg: params.baseConfig,
    flagValue: params.opts.openaiApiKey,
    flagName: "--openai-api-key",
    envVar: "OPENAI_API_KEY",
    runtime: params.runtime,
    allowProfile: false,
  });
  if (!resolved) {
    return null;
  }
  const key = resolved.key;
  const result = upsertSharedEnvVar({ key: "OPENAI_API_KEY", value: key });
  process.env.OPENAI_API_KEY = key;
  params.runtime.log(`Saved OPENAI_API_KEY to ${shortenHomePath(result.path)}`);
  return applyOpenAIConfig(params.nextConfig);
}
