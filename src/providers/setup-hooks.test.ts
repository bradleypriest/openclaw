import { describe, expect, it } from "vitest";
import { ensureBuiltinProviderSetupHooksRegistered } from "./builtin/setup-hooks.js";
import { ZAI_PROVIDER_CONFIG_HOOK_ID } from "./builtin/zai/setup.js";
import { applyProviderSetupHook } from "./setup-hooks.js";

describe("provider setup hooks", () => {
  it("applies registered built-in ZAI setup hook", () => {
    ensureBuiltinProviderSetupHooksRegistered();

    const next = applyProviderSetupHook(ZAI_PROVIDER_CONFIG_HOOK_ID, {
      agents: {
        defaults: {
          models: {
            "zai/glm-4.7": {},
          },
        },
      },
    });

    expect(next.agents?.defaults?.models?.["zai/glm-4.7"]).toMatchObject({
      alias: "GLM",
    });
  });
});
