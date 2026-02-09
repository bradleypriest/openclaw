import type { OpenClawConfig } from "../../config/config.js";
import { discoverBedrockModels } from "./amazon-bedrock/discovery.js";
import { resolveCloudflareAiGatewayImplicitProviders } from "./cloudflare-ai-gateway/models.js";
import { DEFAULT_COPILOT_API_BASE_URL, resolveCopilotApiToken } from "./github-copilot/token.js";
import {
  type BuiltinAuthStoreLike,
  type BuiltinImplicitProviderConfig,
  type BuiltinImplicitProviderResolver,
} from "./implicit-types.js";
import { resolveMinimaxImplicitProviders } from "./minimax/implicit-provider.js";
import { resolveMoonshotImplicitProviders } from "./moonshot/models.js";
import { resolveOllamaImplicitProviders } from "./ollama/implicit-provider.js";
import { resolveQianfanImplicitProviders } from "./qianfan/models.js";
import { resolveQwenPortalImplicitProviders } from "./qwen-portal/implicit-provider.js";
import { resolveSyntheticImplicitProviders } from "./synthetic/models.js";
import { resolveVeniceImplicitProviders } from "./venice/models.js";
import { resolveXiaomiImplicitProviders } from "./xiaomi/models.js";

export type { BuiltinImplicitProviderConfig } from "./implicit-types.js";

export const BUILTIN_IMPLICIT_BEDROCK_PROVIDER_ID = "amazon-bedrock";
export const BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID = "github-copilot";

const BUILTIN_IMPLICIT_PROVIDER_RESOLVERS: BuiltinImplicitProviderResolver[] = [
  resolveMinimaxImplicitProviders,
  resolveMoonshotImplicitProviders,
  resolveSyntheticImplicitProviders,
  resolveVeniceImplicitProviders,
  resolveQwenPortalImplicitProviders,
  resolveXiaomiImplicitProviders,
  resolveCloudflareAiGatewayImplicitProviders,
  resolveOllamaImplicitProviders,
  resolveQianfanImplicitProviders,
];

export async function resolveBuiltinImplicitProviders(params: {
  authStore: BuiltinAuthStoreLike;
  listProfileIdsForProvider: (provider: string) => string[];
  resolveEnvApiKeyVarName: (provider: string) => string | undefined;
  resolveApiKeyFromProfiles: (provider: string) => string | undefined;
}): Promise<Record<string, BuiltinImplicitProviderConfig>> {
  const providers: Record<string, BuiltinImplicitProviderConfig> = {};

  for (const resolveProviders of BUILTIN_IMPLICIT_PROVIDER_RESOLVERS) {
    const resolved = await resolveProviders(params);
    for (const [providerId, config] of Object.entries(resolved)) {
      if (config) {
        providers[providerId] = config;
      }
    }
  }

  return providers;
}

export async function resolveBuiltinImplicitCopilotProvider(params: {
  env?: NodeJS.ProcessEnv;
  authStore: BuiltinAuthStoreLike;
  listProfileIdsForProvider: (provider: string) => string[];
}): Promise<BuiltinImplicitProviderConfig | null> {
  const env = params.env ?? process.env;
  const profileIds = params.listProfileIdsForProvider("github-copilot");
  const hasProfile = profileIds.length > 0;
  const envToken = env.COPILOT_GITHUB_TOKEN ?? env.GH_TOKEN ?? env.GITHUB_TOKEN;
  const githubToken = (envToken ?? "").trim();

  if (!hasProfile && !githubToken) {
    return null;
  }

  let selectedGithubToken = githubToken;
  if (!selectedGithubToken && hasProfile) {
    const profile = params.authStore.profiles[profileIds[0] ?? ""];
    if (profile && profile.type === "token") {
      selectedGithubToken = profile.token ?? "";
    }
  }

  let baseUrl = DEFAULT_COPILOT_API_BASE_URL;
  if (selectedGithubToken) {
    try {
      const token = await resolveCopilotApiToken({
        githubToken: selectedGithubToken,
        env,
      });
      baseUrl = token.baseUrl;
    } catch {
      baseUrl = DEFAULT_COPILOT_API_BASE_URL;
    }
  }

  return {
    baseUrl,
    models: [],
  } satisfies BuiltinImplicitProviderConfig;
}

export async function resolveBuiltinImplicitBedrockProvider(params: {
  config?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  hasAwsCreds: (env: NodeJS.ProcessEnv) => boolean;
}): Promise<BuiltinImplicitProviderConfig | null> {
  const env = params.env ?? process.env;
  const discoveryConfig = params.config?.models?.bedrockDiscovery;
  const enabled = discoveryConfig?.enabled;
  const hasAwsCreds = params.hasAwsCreds(env);

  if (enabled === false) {
    return null;
  }
  if (enabled !== true && !hasAwsCreds) {
    return null;
  }

  const region = discoveryConfig?.region ?? env.AWS_REGION ?? env.AWS_DEFAULT_REGION ?? "us-east-1";
  const models = await discoverBedrockModels({ region, config: discoveryConfig });
  if (models.length === 0) {
    return null;
  }

  return {
    baseUrl: `https://bedrock-runtime.${region}.amazonaws.com`,
    api: "bedrock-converse-stream",
    auth: "aws-sdk",
    models,
  } satisfies BuiltinImplicitProviderConfig;
}
