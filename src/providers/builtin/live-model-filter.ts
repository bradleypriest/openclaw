import { normalizeProviderId } from "../provider-id.js";
import { isBuiltinModernModelRefViaHook } from "./runtime/modern-model-ref-hooks.js";

export type BuiltinModernModelRef = {
  provider?: string | null;
  id?: string | null;
};

export function isBuiltinModernModelRef(ref: BuiltinModernModelRef): boolean {
  const provider = normalizeProviderId(ref.provider ?? "");
  const id = ref.id?.trim().toLowerCase() ?? "";
  if (!provider || !id) {
    return false;
  }
  return isBuiltinModernModelRefViaHook({ provider, modelId: id });
}
