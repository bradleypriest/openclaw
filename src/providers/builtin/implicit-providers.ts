import type { OpenClawConfig } from "../../config/config.js";
import { discoverBedrockModels } from "./amazon-bedrock/discovery.js";
import {
  buildCloudflareAiGatewayModelDefinition,
  resolveCloudflareAiGatewayBaseUrl,
} from "./cloudflare-ai-gateway/models.js";
import { DEFAULT_COPILOT_API_BASE_URL, resolveCopilotApiToken } from "./github-copilot/token.js";
import { type BuiltinAuthStoreLike, type BuiltinImplicitProviderConfig } from "./implicit-types.js";
import {
  buildMinimaxImplicitProviderConfig,
  buildMinimaxPortalImplicitProviderConfig,
  MINIMAX_IMPLICIT_OAUTH_PLACEHOLDER,
} from "./minimax/implicit-provider.js";
import { buildMoonshotProviderConfig } from "./moonshot/models.js";
import { buildOllamaImplicitProviderConfig } from "./ollama/implicit-provider.js";
import { buildQianfanProviderConfig } from "./qianfan/models.js";
import {
  buildQwenPortalImplicitProviderConfig,
  QWEN_PORTAL_IMPLICIT_OAUTH_PLACEHOLDER,
} from "./qwen-portal/implicit-provider.js";
import {
  buildSyntheticModelDefinition,
  SYNTHETIC_BASE_URL,
  SYNTHETIC_MODEL_CATALOG,
} from "./synthetic/models.js";
import { discoverVeniceModels, VENICE_BASE_URL } from "./venice/models.js";
import { buildXiaomiProviderConfig } from "./xiaomi/models.js";

export type { BuiltinImplicitProviderConfig } from "./implicit-types.js";

export const BUILTIN_IMPLICIT_BEDROCK_PROVIDER_ID = "amazon-bedrock";
export const BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID = "github-copilot";

function buildSyntheticProvider(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: SYNTHETIC_BASE_URL,
    api: "anthropic-messages",
    models: SYNTHETIC_MODEL_CATALOG.map(buildSyntheticModelDefinition),
  };
}

async function buildVeniceProvider(): Promise<BuiltinImplicitProviderConfig> {
  const models = await discoverVeniceModels();
  return {
    baseUrl: VENICE_BASE_URL,
    api: "openai-completions",
    models,
  };
}

export async function resolveBuiltinImplicitProviders(params: {
  authStore: BuiltinAuthStoreLike;
  listProfileIdsForProvider: (provider: string) => string[];
  resolveEnvApiKeyVarName: (provider: string) => string | undefined;
  resolveApiKeyFromProfiles: (provider: string) => string | undefined;
}): Promise<Record<string, BuiltinImplicitProviderConfig>> {
  const providers: Record<string, BuiltinImplicitProviderConfig> = {};

  const minimaxKey =
    params.resolveEnvApiKeyVarName("minimax") ?? params.resolveApiKeyFromProfiles("minimax");
  if (minimaxKey) {
    providers.minimax = { ...buildMinimaxImplicitProviderConfig(), apiKey: minimaxKey };
  }

  if (params.listProfileIdsForProvider("minimax-portal").length > 0) {
    providers["minimax-portal"] = {
      ...buildMinimaxPortalImplicitProviderConfig(),
      apiKey: MINIMAX_IMPLICIT_OAUTH_PLACEHOLDER,
    };
  }

  const moonshotKey =
    params.resolveEnvApiKeyVarName("moonshot") ?? params.resolveApiKeyFromProfiles("moonshot");
  if (moonshotKey) {
    providers.moonshot = { ...buildMoonshotProviderConfig(), apiKey: moonshotKey };
  }

  const syntheticKey =
    params.resolveEnvApiKeyVarName("synthetic") ?? params.resolveApiKeyFromProfiles("synthetic");
  if (syntheticKey) {
    providers.synthetic = { ...buildSyntheticProvider(), apiKey: syntheticKey };
  }

  const veniceKey =
    params.resolveEnvApiKeyVarName("venice") ?? params.resolveApiKeyFromProfiles("venice");
  if (veniceKey) {
    providers.venice = { ...(await buildVeniceProvider()), apiKey: veniceKey };
  }

  if (params.listProfileIdsForProvider("qwen-portal").length > 0) {
    providers["qwen-portal"] = {
      ...buildQwenPortalImplicitProviderConfig(),
      apiKey: QWEN_PORTAL_IMPLICIT_OAUTH_PLACEHOLDER,
    };
  }

  const xiaomiKey =
    params.resolveEnvApiKeyVarName("xiaomi") ?? params.resolveApiKeyFromProfiles("xiaomi");
  if (xiaomiKey) {
    providers.xiaomi = { ...buildXiaomiProviderConfig(), apiKey: xiaomiKey };
  }

  const cloudflareProfiles = params.listProfileIdsForProvider("cloudflare-ai-gateway");
  for (const profileId of cloudflareProfiles) {
    const cred = params.authStore.profiles[profileId];
    if (cred?.type !== "api_key") {
      continue;
    }
    const accountId = cred.metadata?.accountId?.trim();
    const gatewayId = cred.metadata?.gatewayId?.trim();
    if (!accountId || !gatewayId) {
      continue;
    }
    const baseUrl = resolveCloudflareAiGatewayBaseUrl({ accountId, gatewayId });
    if (!baseUrl) {
      continue;
    }
    const apiKey =
      params.resolveEnvApiKeyVarName("cloudflare-ai-gateway") ?? cred.key?.trim() ?? "";
    if (!apiKey) {
      continue;
    }
    providers["cloudflare-ai-gateway"] = {
      baseUrl,
      api: "anthropic-messages",
      apiKey,
      models: [buildCloudflareAiGatewayModelDefinition()],
    };
    break;
  }

  const ollamaKey =
    params.resolveEnvApiKeyVarName("ollama") ?? params.resolveApiKeyFromProfiles("ollama");
  if (ollamaKey) {
    providers.ollama = { ...(await buildOllamaImplicitProviderConfig()), apiKey: ollamaKey };
  }

  const qianfanKey =
    params.resolveEnvApiKeyVarName("qianfan") ?? params.resolveApiKeyFromProfiles("qianfan");
  if (qianfanKey) {
    providers.qianfan = { ...buildQianfanProviderConfig(), apiKey: qianfanKey };
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
