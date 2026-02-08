import type { BuiltinImplicitProviderConfig } from "../implicit-types.js";
import { MINIMAX_API_COST } from "./models.js";

const MINIMAX_IMPLICIT_API_BASE_URL = "https://api.minimax.chat/v1";
const MINIMAX_IMPLICIT_PORTAL_BASE_URL = "https://api.minimax.io/anthropic";
const MINIMAX_IMPLICIT_DEFAULT_MODEL_ID = "MiniMax-M2.1";
const MINIMAX_IMPLICIT_DEFAULT_VISION_MODEL_ID = "MiniMax-VL-01";
const MINIMAX_IMPLICIT_DEFAULT_CONTEXT_WINDOW = 200000;
const MINIMAX_IMPLICIT_DEFAULT_MAX_TOKENS = 8192;

export const MINIMAX_IMPLICIT_OAUTH_PLACEHOLDER = "minimax-oauth";

export function buildMinimaxImplicitProviderConfig(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: MINIMAX_IMPLICIT_API_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: MINIMAX_IMPLICIT_DEFAULT_MODEL_ID,
        name: "MiniMax M2.1",
        reasoning: false,
        input: ["text"],
        cost: MINIMAX_API_COST,
        contextWindow: MINIMAX_IMPLICIT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MINIMAX_IMPLICIT_DEFAULT_MAX_TOKENS,
      },
      {
        id: MINIMAX_IMPLICIT_DEFAULT_VISION_MODEL_ID,
        name: "MiniMax VL 01",
        reasoning: false,
        input: ["text", "image"],
        cost: MINIMAX_API_COST,
        contextWindow: MINIMAX_IMPLICIT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MINIMAX_IMPLICIT_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export function buildMinimaxPortalImplicitProviderConfig(): BuiltinImplicitProviderConfig {
  return {
    baseUrl: MINIMAX_IMPLICIT_PORTAL_BASE_URL,
    api: "anthropic-messages",
    models: [
      {
        id: MINIMAX_IMPLICIT_DEFAULT_MODEL_ID,
        name: "MiniMax M2.1",
        reasoning: false,
        input: ["text"],
        cost: MINIMAX_API_COST,
        contextWindow: MINIMAX_IMPLICIT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MINIMAX_IMPLICIT_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}
