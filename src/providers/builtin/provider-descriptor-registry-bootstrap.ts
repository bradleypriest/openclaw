import { AMAZON_BEDROCK_PROVIDER_DESCRIPTOR } from "./amazon-bedrock/descriptor.js";
import { ANTHROPIC_PROVIDER_DESCRIPTOR } from "./anthropic/descriptor.js";
import { CEREBRAS_PROVIDER_DESCRIPTOR } from "./cerebras/descriptor.js";
import { CHUTES_PROVIDER_DESCRIPTOR } from "./chutes/descriptor.js";
import { CLOUDFLARE_AI_GATEWAY_PROVIDER_DESCRIPTOR } from "./cloudflare-ai-gateway/descriptor.js";
import { DEEPGRAM_PROVIDER_DESCRIPTOR } from "./deepgram/descriptor.js";
import { GITHUB_COPILOT_PROVIDER_DESCRIPTOR } from "./github-copilot/descriptor.js";
import { GOOGLE_ANTIGRAVITY_PROVIDER_DESCRIPTOR } from "./google-antigravity/descriptor.js";
import { GOOGLE_GEMINI_CLI_PROVIDER_DESCRIPTOR } from "./google-gemini-cli/descriptor.js";
import { GOOGLE_PROVIDER_DESCRIPTOR } from "./google/descriptor.js";
import { GROQ_PROVIDER_DESCRIPTOR } from "./groq/descriptor.js";
import { KIMI_CODING_PROVIDER_DESCRIPTOR } from "./kimi-coding/descriptor.js";
import { MINIMAX_PORTAL_PROVIDER_DESCRIPTOR } from "./minimax/descriptor.js";
import { MISTRAL_PROVIDER_DESCRIPTOR } from "./mistral/descriptor.js";
import { MOONSHOT_PROVIDER_DESCRIPTOR } from "./moonshot/descriptor.js";
import { OLLAMA_PROVIDER_DESCRIPTOR } from "./ollama/descriptor.js";
import {
  OPENAI_CODEX_PROVIDER_DESCRIPTOR,
  OPENAI_PROVIDER_DESCRIPTOR,
} from "./openai/descriptor.js";
import { OPENCODE_PROVIDER_DESCRIPTOR } from "./opencode/descriptor.js";
import { OPENROUTER_PROVIDER_DESCRIPTOR } from "./openrouter/descriptor.js";
import { registerBuiltinProviderDescriptors } from "./provider-descriptor-registry-core.js";
import { QIANFAN_PROVIDER_DESCRIPTOR } from "./qianfan/descriptor.js";
import { QWEN_PORTAL_PROVIDER_DESCRIPTOR } from "./qwen-portal/descriptor.js";
import { SYNTHETIC_PROVIDER_DESCRIPTOR } from "./synthetic/descriptor.js";
import { VENICE_PROVIDER_DESCRIPTOR } from "./venice/descriptor.js";
import { VERCEL_AI_GATEWAY_PROVIDER_DESCRIPTOR } from "./vercel-ai-gateway/descriptor.js";
import { XAI_PROVIDER_DESCRIPTOR } from "./xai/descriptor.js";
import { XIAOMI_PROVIDER_DESCRIPTOR } from "./xiaomi/descriptor.js";
import { ZAI_PROVIDER_DESCRIPTOR } from "./zai/descriptor.js";

let registered = false;

export function ensureBuiltinProviderDescriptorsRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinProviderDescriptors([
    ANTHROPIC_PROVIDER_DESCRIPTOR,
    OPENROUTER_PROVIDER_DESCRIPTOR,
    GITHUB_COPILOT_PROVIDER_DESCRIPTOR,
    OPENAI_PROVIDER_DESCRIPTOR,
    OPENAI_CODEX_PROVIDER_DESCRIPTOR,
    GOOGLE_PROVIDER_DESCRIPTOR,
    GOOGLE_ANTIGRAVITY_PROVIDER_DESCRIPTOR,
    GOOGLE_GEMINI_CLI_PROVIDER_DESCRIPTOR,
    CHUTES_PROVIDER_DESCRIPTOR,
    CLOUDFLARE_AI_GATEWAY_PROVIDER_DESCRIPTOR,
    ZAI_PROVIDER_DESCRIPTOR,
    QWEN_PORTAL_PROVIDER_DESCRIPTOR,
    MINIMAX_PORTAL_PROVIDER_DESCRIPTOR,
    KIMI_CODING_PROVIDER_DESCRIPTOR,
    MOONSHOT_PROVIDER_DESCRIPTOR,
    OPENCODE_PROVIDER_DESCRIPTOR,
    QIANFAN_PROVIDER_DESCRIPTOR,
    SYNTHETIC_PROVIDER_DESCRIPTOR,
    VENICE_PROVIDER_DESCRIPTOR,
    VERCEL_AI_GATEWAY_PROVIDER_DESCRIPTOR,
    GROQ_PROVIDER_DESCRIPTOR,
    DEEPGRAM_PROVIDER_DESCRIPTOR,
    CEREBRAS_PROVIDER_DESCRIPTOR,
    MISTRAL_PROVIDER_DESCRIPTOR,
    OLLAMA_PROVIDER_DESCRIPTOR,
    XAI_PROVIDER_DESCRIPTOR,
    XIAOMI_PROVIDER_DESCRIPTOR,
    AMAZON_BEDROCK_PROVIDER_DESCRIPTOR,
  ]);

  registered = true;
}
