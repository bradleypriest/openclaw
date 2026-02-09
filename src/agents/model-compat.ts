import type { Api, Model } from "@mariozechner/pi-ai";
import { ensureModelCompatNormalizersRegistered } from "./model-compat-registry-bootstrap.js";
import { listRegisteredModelCompatNormalizers } from "./model-compat-registry-core.js";

export function normalizeModelCompat(model: Model<Api>): Model<Api> {
  ensureModelCompatNormalizersRegistered();
  for (const normalize of listRegisteredModelCompatNormalizers()) {
    const normalized = normalize(model);
    if (normalized) {
      return normalized;
    }
  }
  return model;
}
