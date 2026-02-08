import type { BuiltinProviderDescriptor } from "./descriptor-types.js";
import { normalizeProviderId } from "../provider-id.js";
import { AMAZON_BEDROCK_PROVIDER_DESCRIPTOR } from "./amazon-bedrock/descriptor.js";
import { ANTHROPIC_PROVIDER_DESCRIPTOR } from "./anthropic/descriptor.js";
import { CEREBRAS_PROVIDER_DESCRIPTOR } from "./cerebras/descriptor.js";
import { CHUTES_PROVIDER_DESCRIPTOR } from "./chutes/descriptor.js";
import { DEEPGRAM_PROVIDER_DESCRIPTOR } from "./deepgram/descriptor.js";
import { GITHUB_COPILOT_PROVIDER_DESCRIPTOR } from "./github-copilot/descriptor.js";
import { GOOGLE_ANTIGRAVITY_PROVIDER_DESCRIPTOR } from "./google-antigravity/descriptor.js";
import { GOOGLE_GEMINI_CLI_PROVIDER_DESCRIPTOR } from "./google-gemini-cli/descriptor.js";
import { GROQ_PROVIDER_DESCRIPTOR } from "./groq/descriptor.js";
import { KIMI_CODING_PROVIDER_DESCRIPTOR } from "./kimi-coding/descriptor.js";
import { MINIMAX_PORTAL_PROVIDER_DESCRIPTOR } from "./minimax/descriptor.js";
import { MISTRAL_PROVIDER_DESCRIPTOR } from "./mistral/descriptor.js";
import { OLLAMA_PROVIDER_DESCRIPTOR } from "./ollama/descriptor.js";
import {
  OPENAI_CODEX_PROVIDER_DESCRIPTOR,
  OPENAI_PROVIDER_DESCRIPTOR,
} from "./openai/descriptor.js";
import { OPENCODE_PROVIDER_DESCRIPTOR } from "./opencode/descriptor.js";
import { OPENROUTER_PROVIDER_DESCRIPTOR } from "./openrouter/descriptor.js";
import { QWEN_PORTAL_PROVIDER_DESCRIPTOR } from "./qwen-portal/descriptor.js";
import { ZAI_PROVIDER_DESCRIPTOR } from "./zai/descriptor.js";

const BUILTIN_PROVIDER_DESCRIPTORS: BuiltinProviderDescriptor[] = [
  ANTHROPIC_PROVIDER_DESCRIPTOR,
  OPENROUTER_PROVIDER_DESCRIPTOR,
  GITHUB_COPILOT_PROVIDER_DESCRIPTOR,
  OPENAI_PROVIDER_DESCRIPTOR,
  OPENAI_CODEX_PROVIDER_DESCRIPTOR,
  GOOGLE_ANTIGRAVITY_PROVIDER_DESCRIPTOR,
  GOOGLE_GEMINI_CLI_PROVIDER_DESCRIPTOR,
  CHUTES_PROVIDER_DESCRIPTOR,
  ZAI_PROVIDER_DESCRIPTOR,
  QWEN_PORTAL_PROVIDER_DESCRIPTOR,
  MINIMAX_PORTAL_PROVIDER_DESCRIPTOR,
  KIMI_CODING_PROVIDER_DESCRIPTOR,
  OPENCODE_PROVIDER_DESCRIPTOR,
  GROQ_PROVIDER_DESCRIPTOR,
  DEEPGRAM_PROVIDER_DESCRIPTOR,
  CEREBRAS_PROVIDER_DESCRIPTOR,
  MISTRAL_PROVIDER_DESCRIPTOR,
  OLLAMA_PROVIDER_DESCRIPTOR,
  AMAZON_BEDROCK_PROVIDER_DESCRIPTOR,
];

const BUILTIN_PROVIDER_DESCRIPTOR_BY_ID = new Map(
  BUILTIN_PROVIDER_DESCRIPTORS.map((descriptor) => [descriptor.providerId, descriptor]),
);

export function listBuiltinProviderDescriptors(): BuiltinProviderDescriptor[] {
  return [...BUILTIN_PROVIDER_DESCRIPTORS];
}

export function resolveBuiltinProviderDescriptor(
  providerRaw?: string,
): BuiltinProviderDescriptor | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  return BUILTIN_PROVIDER_DESCRIPTOR_BY_ID.get(normalizeProviderId(provider));
}
