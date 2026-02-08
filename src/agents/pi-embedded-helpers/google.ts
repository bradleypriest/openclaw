import {
  isAntigravityClaudeModel,
  isGoogleModelApi as isBuiltinGoogleModelApi,
} from "../../providers/builtin/runtime-capabilities.js";
import { sanitizeGoogleTurnOrdering } from "./bootstrap.js";

export function isGoogleModelApi(api?: string | null): boolean {
  return isBuiltinGoogleModelApi(api);
}

export function isAntigravityClaude(params: {
  api?: string | null;
  provider?: string | null;
  modelId?: string;
}): boolean {
  const provider = params.provider?.toLowerCase();
  const api = params.api?.toLowerCase();
  return isAntigravityClaudeModel({
    provider,
    api,
    modelId: params.modelId,
  });
}

export { sanitizeGoogleTurnOrdering };
