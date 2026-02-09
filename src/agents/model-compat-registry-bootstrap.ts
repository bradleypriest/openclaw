import { normalizeZaiModelCompat } from "../providers/builtin/zai/model-compat.js";
import { registerModelCompatNormalizers } from "./model-compat-registry-core.js";

let registered = false;

export function ensureModelCompatNormalizersRegistered(): void {
  if (registered) {
    return;
  }

  registerModelCompatNormalizers([
    {
      id: "zai-supports-developer-role",
      normalize: normalizeZaiModelCompat,
    },
  ]);

  registered = true;
}
