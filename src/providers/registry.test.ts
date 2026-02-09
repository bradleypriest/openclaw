import { beforeEach, describe, expect, it } from "vitest";
import {
  listProviderRegistryDiagnostics,
  listProviders,
  registerProvider,
  resolveProvider,
  resetProviderRegistryForTests,
} from "./registry.js";

describe("provider registry", () => {
  beforeEach(() => {
    resetProviderRegistryForTests();
  });

  it("registers and resolves providers", () => {
    registerProvider({ id: "OpenAI", label: "OpenAI" });
    const resolved = resolveProvider("openai");

    expect(resolved?.id).toBe("openai");
    expect(resolved?.label).toBe("OpenAI");
    expect(listProviders()).toHaveLength(1);
  });

  it("emits diagnostics for duplicate ids", () => {
    registerProvider({ id: "openai" });
    registerProvider({ id: "OpenAI", label: "Duplicate" });

    const diagnostics = listProviderRegistryDiagnostics();
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.message).toContain("provider already registered: openai");
    expect(listProviders()).toHaveLength(1);
  });
});
