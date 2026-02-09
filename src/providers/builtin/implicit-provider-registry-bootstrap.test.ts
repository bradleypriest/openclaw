import { describe, expect, it } from "vitest";
import { ensureBuiltinImplicitProviderResolversRegistered } from "./implicit-provider-registry-bootstrap.js";
import { listRegisteredBuiltinImplicitProviderResolverRegistrations } from "./implicit-provider-registry-core.js";

describe("implicit provider resolver registry", () => {
  it("registers deterministic resolver priority order", () => {
    ensureBuiltinImplicitProviderResolversRegistered();
    const ids = listRegisteredBuiltinImplicitProviderResolverRegistrations().map(
      (registration) => registration.id,
    );
    expect(ids).toEqual([
      "minimax",
      "moonshot",
      "synthetic",
      "venice",
      "qwen-portal",
      "xiaomi",
      "cloudflare-ai-gateway",
      "ollama",
      "qianfan",
    ]);
  });
});
