import { isBuiltinModernModelRef } from "../providers/builtin/live-model-filter.js";

export type ModelRef = {
  provider?: string | null;
  id?: string | null;
};

export function isModernModelRef(ref: ModelRef): boolean {
  return isBuiltinModernModelRef(ref);
}
