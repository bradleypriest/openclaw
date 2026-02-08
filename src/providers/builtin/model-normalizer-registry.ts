import { registerProviderModelIdNormalizer } from "../model-normalizers.js";
import { normalizeAnthropicModelId } from "./anthropic/model-normalize.js";
import { normalizeGoogleProviderModelId } from "./google/model-normalize.js";

let registered = false;

export function ensureBuiltinProviderModelNormalizersRegistered(): void {
  if (registered) {
    return;
  }

  registerProviderModelIdNormalizer("anthropic", normalizeAnthropicModelId);
  registerProviderModelIdNormalizer("google", normalizeGoogleProviderModelId);

  registered = true;
}
