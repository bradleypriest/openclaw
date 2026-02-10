import { beforeEach, describe, expect, it } from "vitest";
import {
  ensureCoreProvidersRegistered,
  listProviderRegistryDiagnostics,
  listProviders,
  resetProviderRegistryForTests,
} from "./registry.js";

describe("provider registry coverage", () => {
  beforeEach(() => {
    resetProviderRegistryForTests();
  });

  it("registers core providers once", () => {
    ensureCoreProvidersRegistered();
    const providerIds = listProviders().map((provider) => provider.id);
    const expected = ["openai", "openai-codex", "anthropic"];

    for (const id of expected) {
      const matches = providerIds.filter((providerId) => providerId === id);
      expect(matches).toHaveLength(1);
    }

    const duplicates = listProviderRegistryDiagnostics().filter((diag) =>
      diag.message.includes("already registered"),
    );
    expect(duplicates).toHaveLength(0);
  });
});
