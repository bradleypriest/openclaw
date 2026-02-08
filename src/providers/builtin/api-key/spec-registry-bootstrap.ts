import {
  CLOUDFLARE_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS,
  CLOUDFLARE_AI_GATEWAY_NON_INTERACTIVE_API_KEY_SPECS,
  CLOUDFLARE_AI_GATEWAY_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../cloudflare-ai-gateway/api-key.js";
import {
  GOOGLE_INTERACTIVE_API_KEY_SPECS,
  GOOGLE_NON_INTERACTIVE_API_KEY_SPECS,
  GOOGLE_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../google/api-key.js";
import {
  KIMI_CODING_INTERACTIVE_API_KEY_SPECS,
  KIMI_CODING_NON_INTERACTIVE_API_KEY_SPECS,
  KIMI_CODING_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../kimi-coding/api-key.js";
import {
  MINIMAX_NON_INTERACTIVE_API_KEY_SPECS,
  MINIMAX_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../minimax/api-key.js";
import {
  MOONSHOT_INTERACTIVE_API_KEY_SPECS,
  MOONSHOT_NON_INTERACTIVE_API_KEY_SPECS,
  MOONSHOT_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../moonshot/api-key.js";
import { OPENAI_PROVIDER_AUTH_CHOICE_ALIASES } from "../openai/api-key.js";
import {
  OPENCODE_INTERACTIVE_API_KEY_SPECS,
  OPENCODE_NON_INTERACTIVE_API_KEY_SPECS,
  OPENCODE_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../opencode/api-key.js";
import {
  OPENROUTER_INTERACTIVE_API_KEY_SPECS,
  OPENROUTER_NON_INTERACTIVE_API_KEY_SPECS,
  OPENROUTER_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../openrouter/api-key.js";
import {
  SYNTHETIC_INTERACTIVE_API_KEY_SPECS,
  SYNTHETIC_NON_INTERACTIVE_API_KEY_SPECS,
  SYNTHETIC_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../synthetic/api-key.js";
import {
  VENICE_INTERACTIVE_API_KEY_SPECS,
  VENICE_NON_INTERACTIVE_API_KEY_SPECS,
  VENICE_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../venice/api-key.js";
import {
  VERCEL_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS,
  VERCEL_AI_GATEWAY_NON_INTERACTIVE_API_KEY_SPECS,
  VERCEL_AI_GATEWAY_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../vercel-ai-gateway/api-key.js";
import {
  XAI_NON_INTERACTIVE_API_KEY_SPECS,
  XAI_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../xai/api-key.js";
import {
  XIAOMI_INTERACTIVE_API_KEY_SPECS,
  XIAOMI_NON_INTERACTIVE_API_KEY_SPECS,
  XIAOMI_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../xiaomi/api-key.js";
import {
  ZAI_INTERACTIVE_API_KEY_SPECS,
  ZAI_NON_INTERACTIVE_API_KEY_SPECS,
  ZAI_PROVIDER_AUTH_CHOICE_ALIASES,
} from "../zai/api-key.js";
import {
  registerBuiltinApiKeyProviderAuthChoiceAliases,
  registerBuiltinInteractiveApiKeySpecs,
  registerBuiltinNonInteractiveApiKeySpecs,
} from "./spec-registry-core.js";

let registered = false;

export function ensureBuiltinApiKeySpecsRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinInteractiveApiKeySpecs(OPENROUTER_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(VERCEL_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(CLOUDFLARE_AI_GATEWAY_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(MOONSHOT_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(KIMI_CODING_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(GOOGLE_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(ZAI_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(XIAOMI_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(SYNTHETIC_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(VENICE_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinInteractiveApiKeySpecs(OPENCODE_INTERACTIVE_API_KEY_SPECS);

  registerBuiltinNonInteractiveApiKeySpecs(GOOGLE_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(ZAI_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(XIAOMI_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(XAI_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(OPENROUTER_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(VERCEL_AI_GATEWAY_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(CLOUDFLARE_AI_GATEWAY_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(MOONSHOT_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(KIMI_CODING_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(SYNTHETIC_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(VENICE_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(MINIMAX_NON_INTERACTIVE_API_KEY_SPECS);
  registerBuiltinNonInteractiveApiKeySpecs(OPENCODE_NON_INTERACTIVE_API_KEY_SPECS);

  registerBuiltinApiKeyProviderAuthChoiceAliases(OPENAI_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(OPENROUTER_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(VERCEL_AI_GATEWAY_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(
    CLOUDFLARE_AI_GATEWAY_PROVIDER_AUTH_CHOICE_ALIASES,
  );
  registerBuiltinApiKeyProviderAuthChoiceAliases(MOONSHOT_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(KIMI_CODING_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(GOOGLE_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(ZAI_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(XIAOMI_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(XAI_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(SYNTHETIC_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(VENICE_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(OPENCODE_PROVIDER_AUTH_CHOICE_ALIASES);
  registerBuiltinApiKeyProviderAuthChoiceAliases(MINIMAX_PROVIDER_AUTH_CHOICE_ALIASES);

  registered = true;
}
