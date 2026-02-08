import type { OpenClawConfig } from "../../../config/config.js";
import { GOOGLE_GEMINI_DEFAULT_MODEL } from "../../../commands/google-gemini-model-default.js";
import { ensureModelAllowlistEntry } from "../../../commands/model-allowlist.js";
import { applyPrimaryDefaultModel } from "../default-model.js";

export function applyGoogleProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  return ensureModelAllowlistEntry({
    cfg,
    modelRef: GOOGLE_GEMINI_DEFAULT_MODEL,
    defaultProvider: "google",
  });
}

export function applyGoogleConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyPrimaryDefaultModel(applyGoogleProviderConfig(cfg), GOOGLE_GEMINI_DEFAULT_MODEL);
}
