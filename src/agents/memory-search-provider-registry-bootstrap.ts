import { registerMemorySearchProviderBehaviors } from "./memory-search-provider-registry-core.js";

export const DEFAULT_OPENAI_MEMORY_SEARCH_MODEL = "text-embedding-3-small";
export const DEFAULT_GEMINI_MEMORY_SEARCH_MODEL = "gemini-embedding-001";
export const DEFAULT_VOYAGE_MEMORY_SEARCH_MODEL = "voyage-4-large";

let registered = false;

export function ensureMemorySearchProviderBehaviorsRegistered(): void {
  if (registered) {
    return;
  }

  registerMemorySearchProviderBehaviors([
    {
      provider: "openai",
      behavior: {
        includeRemoteByDefault: true,
        defaultModel: DEFAULT_OPENAI_MEMORY_SEARCH_MODEL,
      },
    },
    {
      provider: "gemini",
      behavior: {
        includeRemoteByDefault: true,
        defaultModel: DEFAULT_GEMINI_MEMORY_SEARCH_MODEL,
      },
    },
    {
      provider: "voyage",
      behavior: {
        includeRemoteByDefault: true,
        defaultModel: DEFAULT_VOYAGE_MEMORY_SEARCH_MODEL,
      },
    },
    {
      provider: "auto",
      behavior: {
        includeRemoteByDefault: true,
      },
    },
    {
      provider: "local",
      behavior: {
        includeRemoteByDefault: false,
      },
    },
  ]);

  registered = true;
}
