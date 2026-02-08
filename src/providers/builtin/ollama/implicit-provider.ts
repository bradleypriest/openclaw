import type { ModelDefinitionConfig } from "../../../config/types.models.js";
import type { BuiltinImplicitProviderConfig } from "../implicit-types.js";

const OLLAMA_IMPLICIT_BASE_URL = "http://127.0.0.1:11434/v1";
const OLLAMA_IMPLICIT_API_BASE_URL = "http://127.0.0.1:11434";
const OLLAMA_IMPLICIT_DEFAULT_CONTEXT_WINDOW = 128000;
const OLLAMA_IMPLICIT_DEFAULT_MAX_TOKENS = 8192;
const OLLAMA_IMPLICIT_DEFAULT_COST = {
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

export async function discoverOllamaImplicitModels(): Promise<ModelDefinitionConfig[]> {
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return [];
  }
  try {
    const response = await fetch(`${OLLAMA_IMPLICIT_API_BASE_URL}/api/tags`, {
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
        cost: OLLAMA_IMPLICIT_DEFAULT_COST,
        contextWindow: OLLAMA_IMPLICIT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: OLLAMA_IMPLICIT_DEFAULT_MAX_TOKENS,
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

export async function buildOllamaImplicitProviderConfig(): Promise<BuiltinImplicitProviderConfig> {
  const models = await discoverOllamaImplicitModels();
  return {
    baseUrl: OLLAMA_IMPLICIT_BASE_URL,
    api: "openai-completions",
    models,
  };
}
