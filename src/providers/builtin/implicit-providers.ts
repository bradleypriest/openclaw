import type { OpenClawConfig } from "../../config/config.js";
import type { ModelDefinitionConfig } from "../../config/types.models.js";
import { DEFAULT_COPILOT_API_BASE_URL, resolveCopilotApiToken } from "../github-copilot-token.js";
import { discoverBedrockModels } from "./amazon-bedrock/discovery.js";
import {
  buildCloudflareAiGatewayModelDefinition,
  resolveCloudflareAiGatewayBaseUrl,
} from "./cloudflare-ai-gateway/models.js";
import { buildMoonshotProviderConfig } from "./moonshot/models.js";
import {
  buildSyntheticModelDefinition,
  SYNTHETIC_BASE_URL,
  SYNTHETIC_MODEL_CATALOG,
} from "./synthetic/models.js";
import { discoverVeniceModels, VENICE_BASE_URL } from "./venice/models.js";
import { buildXiaomiProviderConfig } from "./xiaomi/models.js";

type ModelsConfig = NonNullable<OpenClawConfig["models"]>;
export type BuiltinImplicitProviderConfig = NonNullable<ModelsConfig["providers"]>[string];

export const BUILTIN_IMPLICIT_BEDROCK_PROVIDER_ID = "amazon-bedrock";
export const BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID = "github-copilot";

type BuiltinAuthProfileLike = {
  type?: string;
  key?: string;
  token?: string;
  metadata?: {
    accountId?: string;
    gatewayId?: string;
  };
};

type BuiltinAuthStoreLike = {
  profiles: Record<string, BuiltinAuthProfileLike | undefined>;
};

const MINIMAX_API_BASE_URL = "https://api.minimax.chat/v1";
const MINIMAX_PORTAL_BASE_URL = "https://api.minimax.io/anthropic";
const MINIMAX_DEFAULT_MODEL_ID = "MiniMax-M2.1";
const MINIMAX_DEFAULT_VISION_MODEL_ID = "MiniMax-VL-01";
const MINIMAX_DEFAULT_CONTEXT_WINDOW = 200000;
const MINIMAX_DEFAULT_MAX_TOKENS = 8192;
const MINIMAX_OAUTH_PLACEHOLDER = "minimax-oauth";
// Pricing: MiniMax doesn't publish public rates. Override in models.json for accurate costs.
const MINIMAX_API_COST = {
  input: 15,
  output: 60,
  cacheRead: 2,
  cacheWrite: 10,
};

const QWEN_PORTAL_BASE_URL = "https://portal.qwen.ai/v1";
const QWEN_PORTAL_OAUTH_PLACEHOLDER = "qwen-oauth";
const QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW = 128000;
const QWEN_PORTAL_DEFAULT_MAX_TOKENS = 8192;
const QWEN_PORTAL_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1";
const OLLAMA_API_BASE_URL = "http://127.0.0.1:11434";
const OLLAMA_DEFAULT_CONTEXT_WINDOW = 128000;
const OLLAMA_DEFAULT_MAX_TOKENS = 8192;
const OLLAMA_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

interface OllamaModel {
  name: string;
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

async function discoverOllamaModels(): Promise<ModelDefinitionConfig[]> {
  // Skip Ollama discovery in test environments.
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return [];
  }
  try {
    const response = await fetch(`${OLLAMA_API_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn(`Failed to discover Ollama models: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as OllamaTagsResponse;
    if (!data.models || data.models.length === 0) {
      console.warn("No Ollama models found on local instance");
      return [];
    }
    return data.models.map((model) => {
      const modelId = model.name;
      const isReasoning =
        modelId.toLowerCase().includes("r1") || modelId.toLowerCase().includes("reasoning");
      return {
        id: modelId,
        name: modelId,
        reasoning: isReasoning,
        input: ["text"],
        cost: OLLAMA_DEFAULT_COST,
        contextWindow: OLLAMA_DEFAULT_CONTEXT_WINDOW,
        maxTokens: OLLAMA_DEFAULT_MAX_TOKENS,
        params: {
          streaming: false,
        },
      };
    });
  } catch (error) {
    console.warn(`Failed to discover Ollama models: ${String(error)}`);
    return [];
  }
}

function buildMinimaxProvider(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: MINIMAX_API_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: MINIMAX_DEFAULT_MODEL_ID,
        name: "MiniMax M2.1",
        reasoning: false,
        input: ["text"],
        cost: MINIMAX_API_COST,
        contextWindow: MINIMAX_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MINIMAX_DEFAULT_MAX_TOKENS,
      },
      {
        id: MINIMAX_DEFAULT_VISION_MODEL_ID,
        name: "MiniMax VL 01",
        reasoning: false,
        input: ["text", "image"],
        cost: MINIMAX_API_COST,
        contextWindow: MINIMAX_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MINIMAX_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

function buildMinimaxPortalProvider(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: MINIMAX_PORTAL_BASE_URL,
    api: "anthropic-messages",
    models: [
      {
        id: MINIMAX_DEFAULT_MODEL_ID,
        name: "MiniMax M2.1",
        reasoning: false,
        input: ["text"],
        cost: MINIMAX_API_COST,
        contextWindow: MINIMAX_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MINIMAX_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

function buildQwenPortalProvider(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: QWEN_PORTAL_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: "coder-model",
        name: "Qwen Coder",
        reasoning: false,
        input: ["text"],
        cost: QWEN_PORTAL_DEFAULT_COST,
        contextWindow: QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_PORTAL_DEFAULT_MAX_TOKENS,
      },
      {
        id: "vision-model",
        name: "Qwen Vision",
        reasoning: false,
        input: ["text", "image"],
        cost: QWEN_PORTAL_DEFAULT_COST,
        contextWindow: QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_PORTAL_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

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

async function buildOllamaProvider(): Promise<BuiltinImplicitProviderConfig> {
  const models = await discoverOllamaModels();
  return {
    baseUrl: OLLAMA_BASE_URL,
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
    providers.minimax = { ...buildMinimaxProvider(), apiKey: minimaxKey };
  }

  if (params.listProfileIdsForProvider("minimax-portal").length > 0) {
    providers["minimax-portal"] = {
      ...buildMinimaxPortalProvider(),
      apiKey: MINIMAX_OAUTH_PLACEHOLDER,
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
      ...buildQwenPortalProvider(),
      apiKey: QWEN_PORTAL_OAUTH_PLACEHOLDER,
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
    providers.ollama = { ...(await buildOllamaProvider()), apiKey: ollamaKey };
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
