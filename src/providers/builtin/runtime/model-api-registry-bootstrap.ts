import { registerBuiltinModelApiTags } from "./model-api-registry-core.js";

let registered = false;

export function ensureBuiltinModelApiTagsRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinModelApiTags([
    { api: "openai", tags: ["openai"] },
    { api: "openai-completions", tags: ["openai"] },
    { api: "openai-responses", tags: ["openai"] },
    { api: "openai-codex-responses", tags: ["openai"] },
    { api: "google-antigravity", tags: ["google"] },
    { api: "google-gemini-cli", tags: ["google"] },
    { api: "google-generative-ai", tags: ["google"] },
  ]);

  registered = true;
}
