import { ensureBuiltinThoughtSignatureSanitizationHooksRegistered } from "./thought-signature-registry-bootstrap.js";
import {
  resolveBuiltinThoughtSignatureSanitizationHook,
  type ThoughtSignatureSanitizationPolicy,
} from "./thought-signature-registry-core.js";

export type { ThoughtSignatureSanitizationPolicy };

export function resolveThoughtSignatureSanitizationViaHook(params: {
  provider: string;
  modelId: string;
}): ThoughtSignatureSanitizationPolicy | undefined {
  ensureBuiltinThoughtSignatureSanitizationHooksRegistered();
  const hook = resolveBuiltinThoughtSignatureSanitizationHook(params.provider);
  if (!hook) {
    return undefined;
  }
  return hook(params.modelId);
}
