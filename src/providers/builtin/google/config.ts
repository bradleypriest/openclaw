import type { OpenClawConfig } from "../../../config/config.js";
import { ensureModelAllowlistEntry } from "../../model-allowlist.js";
import { applyPrimaryDefaultModel } from "../default-model.js";
import { GOOGLE_GEMINI_DEFAULT_MODEL } from "./models.js";

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
