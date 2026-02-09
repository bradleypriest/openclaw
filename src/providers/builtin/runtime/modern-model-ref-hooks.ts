import { ensureBuiltinModernModelRefHooksRegistered } from "./modern-model-ref-registry-bootstrap.js";
import { resolveBuiltinModernModelRefHook } from "./modern-model-ref-registry-core.js";

export function isBuiltinModernModelRefViaHook(params: {
  provider: string;
  modelId: string;
}): boolean {
  ensureBuiltinModernModelRefHooksRegistered();
  const hook = resolveBuiltinModernModelRefHook(params.provider);
  if (!hook) {
    return false;
  }
  return hook(params.modelId);
}
