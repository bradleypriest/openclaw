import { normalizeProviderId } from "../../provider-id.js";

export const EXTERNAL_CLI_QWEN_PROVIDER_ID = "qwen-portal";
export const EXTERNAL_CLI_MINIMAX_PROVIDER_ID = "minimax-portal";

const EXTERNAL_CLI_PROVIDER_IDS = new Set([
  EXTERNAL_CLI_QWEN_PROVIDER_ID,
  EXTERNAL_CLI_MINIMAX_PROVIDER_ID,
]);

export function isExternalCliOAuthProvider(provider: string): boolean {
  return EXTERNAL_CLI_PROVIDER_IDS.has(normalizeProviderId(provider));
}
