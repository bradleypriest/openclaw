import { describe, expect, it } from "vitest";
import { resolveProviderEnvVarCandidates } from "./auth-env-vars.js";

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
});
