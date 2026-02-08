import { ANTHROPIC_MODERN_MODEL_PREFIXES } from "../anthropic/live-models.js";
import { GOOGLE_MODERN_MODEL_PREFIXES } from "../google/live-models.js";
import { MINIMAX_MODERN_MODEL_PREFIXES } from "../minimax/live-models.js";
import {
  OPENAI_CODEX_MODERN_MODEL_PREFIXES,
  OPENAI_MODERN_MODEL_PREFIXES,
} from "../openai/live-models.js";
import { XAI_MODERN_MODEL_PREFIXES } from "../xai/live-models.js";
import { ZAI_MODERN_MODEL_PREFIXES } from "../zai/live-models.js";

const OPENROUTER_MODERN_MODEL_MARKERS = [
  ...ANTHROPIC_MODERN_MODEL_PREFIXES,
  ...OPENAI_MODERN_MODEL_PREFIXES,
  ...OPENAI_CODEX_MODERN_MODEL_PREFIXES,
  ...GOOGLE_MODERN_MODEL_PREFIXES,
  ...ZAI_MODERN_MODEL_PREFIXES,
  ...MINIMAX_MODERN_MODEL_PREFIXES,
  ...XAI_MODERN_MODEL_PREFIXES,
];

function matchesAny(id: string, values: string[]): boolean {
  return values.some((value) => id.includes(value));
}

export function isOpenRouterModernModelId(id: string): boolean {
  return matchesAny(id, OPENROUTER_MODERN_MODEL_MARKERS);
}
