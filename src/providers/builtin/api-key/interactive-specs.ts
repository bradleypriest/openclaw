import { normalizeProviderId } from "../../../agents/model-selection.js";
import { CLOUDFLARE_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS } from "../cloudflare-ai-gateway/api-key.js";
import { GOOGLE_INTERACTIVE_API_KEY_SPECS } from "../google/api-key.js";
import { KIMI_CODING_INTERACTIVE_API_KEY_SPECS } from "../kimi-coding/api-key.js";
import { MOONSHOT_INTERACTIVE_API_KEY_SPECS } from "../moonshot/api-key.js";
import { OPENCODE_INTERACTIVE_API_KEY_SPECS } from "../opencode/api-key.js";
import { OPENROUTER_INTERACTIVE_API_KEY_SPECS } from "../openrouter/api-key.js";
import { SYNTHETIC_INTERACTIVE_API_KEY_SPECS } from "../synthetic/api-key.js";
import { VENICE_INTERACTIVE_API_KEY_SPECS } from "../venice/api-key.js";
import { VERCEL_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS } from "../vercel-ai-gateway/api-key.js";
import { XIAOMI_INTERACTIVE_API_KEY_SPECS } from "../xiaomi/api-key.js";
import { ZAI_INTERACTIVE_API_KEY_SPECS } from "../zai/api-key.js";

export const BUILTIN_INTERACTIVE_API_KEY_SPECS = [
  ...OPENROUTER_INTERACTIVE_API_KEY_SPECS,
  ...VERCEL_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS,
  ...CLOUDFLARE_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS,
  ...MOONSHOT_INTERACTIVE_API_KEY_SPECS,
  ...KIMI_CODING_INTERACTIVE_API_KEY_SPECS,
  ...GOOGLE_INTERACTIVE_API_KEY_SPECS,
  ...ZAI_INTERACTIVE_API_KEY_SPECS,
  ...XIAOMI_INTERACTIVE_API_KEY_SPECS,
  ...SYNTHETIC_INTERACTIVE_API_KEY_SPECS,
  ...VENICE_INTERACTIVE_API_KEY_SPECS,
  ...OPENCODE_INTERACTIVE_API_KEY_SPECS,
];

export const BUILTIN_INTERACTIVE_API_KEY_BY_AUTH_CHOICE = new Map(
  BUILTIN_INTERACTIVE_API_KEY_SPECS.map((spec) => [spec.authChoice, spec]),
);

export const BUILTIN_TOKEN_PROVIDER_TO_AUTH_CHOICE = (() => {
  const map = new Map<string, string>();
  for (const spec of BUILTIN_INTERACTIVE_API_KEY_SPECS) {
    for (const tokenProvider of spec.tokenProviders) {
      const normalized = normalizeProviderId(tokenProvider);
      if (!map.has(normalized)) {
        map.set(normalized, spec.authChoice);
      }
    }
  }
  return map;
})();
