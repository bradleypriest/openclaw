import type { OpenClawConfig } from "../../../config/config.js";
import { applyProviderSetupHook } from "../../setup-hooks.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import { ensureBuiltinProviderSetupHooksRegistered } from "../setup-hooks.js";
import { ZAI_DEFAULT_MODEL_REF } from "./constants.js";
import { ZAI_PROVIDER_CONFIG_HOOK_ID } from "./setup.js";

export function applyZaiConfig(cfg: OpenClawConfig): OpenClawConfig {
  ensureBuiltinProviderSetupHooksRegistered();
  const next = applyProviderSetupHook(ZAI_PROVIDER_CONFIG_HOOK_ID, cfg);
  return applyPrimaryDefaultModel(next, ZAI_DEFAULT_MODEL_REF);
}
