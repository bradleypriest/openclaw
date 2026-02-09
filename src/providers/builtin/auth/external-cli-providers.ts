import { hasBuiltinProviderTag } from "../runtime/provider-tags.js";

export const EXTERNAL_CLI_QWEN_PROVIDER_ID = "qwen-portal";
export const EXTERNAL_CLI_MINIMAX_PROVIDER_ID = "minimax-portal";

export function isExternalCliOAuthProvider(provider: string): boolean {
  return hasBuiltinProviderTag(provider, "external-cli-oauth");
}
