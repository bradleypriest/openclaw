import { isMistralTranscriptModel } from "./mistral/transcript-policy.js";
import {
  isAntigravityClaudeModel as isBuiltinAntigravityClaudeModel,
  isAnthropicProvider,
  isGoogleModelApi,
  isOpenAiFamilyProvider,
  shouldSanitizeGeminiThoughtSignatures,
} from "./runtime-capabilities.js";

type ToolCallIdMode = "strict" | "strict9";

type TranscriptPolicyFlags = {
  isOpenAi: boolean;
  needsNonImageSanitize: boolean;
  sanitizeToolCallIds: boolean;
  toolCallIdMode?: ToolCallIdMode;
  repairToolUseResultPairing: boolean;
  sanitizeThoughtSignatures?: {
    allowBase64Only?: boolean;
    includeCamelCase?: boolean;
  };
  normalizeAntigravityThinkingBlocks: boolean;
  applyGoogleTurnOrdering: boolean;
  validateGeminiTurns: boolean;
  validateAnthropicTurns: boolean;
  allowSyntheticToolResults: boolean;
  preserveSignatures: boolean;
};

const OPENAI_MODEL_APIS = new Set([
  "openai",
  "openai-completions",
  "openai-responses",
  "openai-codex-responses",
]);

function isOpenAiApi(modelApi?: string | null): boolean {
  if (!modelApi) {
    return false;
  }
  return OPENAI_MODEL_APIS.has(modelApi);
}

function isOpenAiProvider(provider?: string | null): boolean {
  return isOpenAiFamilyProvider(provider ?? undefined);
}

function isAnthropicApi(modelApi?: string | null, provider?: string | null): boolean {
  if (modelApi === "anthropic-messages") {
    return true;
  }
  return isAnthropicProvider(provider ?? undefined);
}

export function resolveBuiltinTranscriptPolicyFlags(params: {
  modelApi?: string | null;
  provider?: string | null;
  modelId?: string | null;
}): TranscriptPolicyFlags {
  const provider = params.provider ?? "";
  const modelId = params.modelId ?? "";
  const isGoogle = isGoogleModelApi(params.modelApi);
  const isAnthropic = isAnthropicApi(params.modelApi, provider);
  const isOpenAi = isOpenAiProvider(provider) || (!provider && isOpenAiApi(params.modelApi));
  const isMistral = isMistralTranscriptModel({ provider, modelId });
  const isOpenRouterGemini =
    shouldSanitizeGeminiThoughtSignatures(provider) && modelId.toLowerCase().includes("gemini");
  const isAntigravityClaudeModel = isBuiltinAntigravityClaudeModel({
    api: params.modelApi,
    provider,
    modelId,
  });

  const needsNonImageSanitize = isGoogle || isAnthropic || isMistral || isOpenRouterGemini;
  const sanitizeToolCallIds = isGoogle || isMistral;
  const toolCallIdMode: ToolCallIdMode | undefined = isMistral
    ? "strict9"
    : sanitizeToolCallIds
      ? "strict"
      : undefined;
  const repairToolUseResultPairing = isGoogle || isAnthropic;
  const sanitizeThoughtSignatures = isOpenRouterGemini
    ? { allowBase64Only: true, includeCamelCase: true }
    : undefined;

  return {
    isOpenAi,
    needsNonImageSanitize,
    sanitizeToolCallIds,
    toolCallIdMode,
    repairToolUseResultPairing,
    sanitizeThoughtSignatures,
    normalizeAntigravityThinkingBlocks: isAntigravityClaudeModel,
    applyGoogleTurnOrdering: isGoogle,
    validateGeminiTurns: isGoogle,
    validateAnthropicTurns: isAnthropic,
    allowSyntheticToolResults: isGoogle || isAnthropic,
    preserveSignatures: isAntigravityClaudeModel,
  };
}
