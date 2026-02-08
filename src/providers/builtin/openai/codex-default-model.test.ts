import { describe, expect, it } from "vitest";
import type { OpenClawConfig } from "../../../config/config.js";
import { applyOpenAICodexModelDefault, OPENAI_CODEX_DEFAULT_MODEL } from "./codex-default-model.js";
import { OPENAI_DEFAULT_MODEL } from "./default-model.js";

describe("applyOpenAICodexModelDefault", () => {
  it("sets openai-codex default when model is unset", () => {
    const cfg: OpenClawConfig = { agents: { defaults: {} } };
    const applied = applyOpenAICodexModelDefault(cfg);
    expect(applied.changed).toBe(true);
    expect(applied.next.agents?.defaults?.model).toEqual({
      primary: OPENAI_CODEX_DEFAULT_MODEL,
    });
  });

  it("sets openai-codex default when model is openai/*", () => {
    const cfg: OpenClawConfig = {
      agents: { defaults: { model: { primary: OPENAI_DEFAULT_MODEL } } },
    };
    const applied = applyOpenAICodexModelDefault(cfg);
    expect(applied.changed).toBe(true);
    expect(applied.next.agents?.defaults?.model).toEqual({
      primary: OPENAI_CODEX_DEFAULT_MODEL,
    });
  });

  it("does not override openai-codex/*", () => {
    const cfg: OpenClawConfig = {
      agents: { defaults: { model: { primary: OPENAI_CODEX_DEFAULT_MODEL } } },
    };
    const applied = applyOpenAICodexModelDefault(cfg);
    expect(applied.changed).toBe(false);
    expect(applied.next).toEqual(cfg);
  });

  it("does not override non-openai models", () => {
    const cfg: OpenClawConfig = {
      agents: { defaults: { model: { primary: "anthropic/claude-opus-4-5" } } },
    };
    const applied = applyOpenAICodexModelDefault(cfg);
    expect(applied.changed).toBe(false);
    expect(applied.next).toEqual(cfg);
  });
});
