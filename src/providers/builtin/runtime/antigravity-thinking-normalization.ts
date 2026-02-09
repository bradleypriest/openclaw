import { ensureBuiltinAntigravityThinkingNormalizationHooksRegistered } from "./antigravity-thinking-registry-bootstrap.js";
import { resolveBuiltinAntigravityThinkingNormalizationHook } from "./antigravity-thinking-registry-core.js";

export function shouldNormalizeAntigravityThinkingViaHook(params: {
  provider: string;
  modelId: string;
}): boolean {
  ensureBuiltinAntigravityThinkingNormalizationHooksRegistered();
  const hook = resolveBuiltinAntigravityThinkingNormalizationHook(params.provider);
  if (!hook) {
    return false;
  }
  return hook(params.modelId);
}
