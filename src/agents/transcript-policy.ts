import type { ToolCallIdMode } from "./tool-call-id.js";
import { resolveBuiltinTranscriptPolicyFlags } from "../providers/builtin/transcript-policy.js";

export type TranscriptSanitizeMode = "full" | "images-only";

export type TranscriptPolicy = {
  sanitizeMode: TranscriptSanitizeMode;
  sanitizeToolCallIds: boolean;
  toolCallIdMode?: ToolCallIdMode;
  repairToolUseResultPairing: boolean;
  preserveSignatures: boolean;
  sanitizeThoughtSignatures?: {
    allowBase64Only?: boolean;
    includeCamelCase?: boolean;
  };
  normalizeAntigravityThinkingBlocks: boolean;
  applyGoogleTurnOrdering: boolean;
  validateGeminiTurns: boolean;
  validateAnthropicTurns: boolean;
  allowSyntheticToolResults: boolean;
};

export function resolveTranscriptPolicy(params: {
  modelApi?: string | null;
  provider?: string | null;
  modelId?: string | null;
}): TranscriptPolicy {
  const flags = resolveBuiltinTranscriptPolicyFlags(params);

  return {
    sanitizeMode: flags.isOpenAi
      ? "images-only"
      : flags.needsNonImageSanitize
        ? "full"
        : "images-only",
    sanitizeToolCallIds: !flags.isOpenAi && flags.sanitizeToolCallIds,
    toolCallIdMode: flags.toolCallIdMode,
    repairToolUseResultPairing: !flags.isOpenAi && flags.repairToolUseResultPairing,
    preserveSignatures: flags.preserveSignatures,
    sanitizeThoughtSignatures: flags.isOpenAi ? undefined : flags.sanitizeThoughtSignatures,
    normalizeAntigravityThinkingBlocks: flags.normalizeAntigravityThinkingBlocks,
    applyGoogleTurnOrdering: !flags.isOpenAi && flags.applyGoogleTurnOrdering,
    validateGeminiTurns: !flags.isOpenAi && flags.validateGeminiTurns,
    validateAnthropicTurns: !flags.isOpenAi && flags.validateAnthropicTurns,
    allowSyntheticToolResults: !flags.isOpenAi && flags.allowSyntheticToolResults,
  };
}
