import { describe, expect, it } from "vitest";
import { resolveProviderEnvApiKey, resolveProviderEnvVarCandidates } from "./auth-env-vars.js";

describe("auth-env-vars", () => {
  it("returns built-in env var aliases for providers", () => {
    expect(resolveProviderEnvVarCandidates("z-ai", { includeDeclarative: false })).toEqual([
      "ZAI_API_KEY",
      "Z_AI_API_KEY",
    ]);
    expect(resolveProviderEnvVarCandidates("opencode", { includeDeclarative: false })).toEqual([
      "OPENCODE_API_KEY",
      "OPENCODE_ZEN_API_KEY",
    ]);
  });

  it("resolves first available env var candidate", () => {
    const resolved = resolveProviderEnvApiKey({
      provider: "zai",
      resolveEnvVar: (envVar) =>
        envVar === "Z_AI_API_KEY" ? { apiKey: "zai-key", source: "env: Z_AI_API_KEY" } : null,
      includeDeclarative: false,
    });

    expect(resolved).toEqual({ apiKey: "zai-key", source: "env: Z_AI_API_KEY" });
  });
});
