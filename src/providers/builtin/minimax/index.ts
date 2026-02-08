import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceMiniMax } from "./interactive-auth.js";

export function registerMiniMaxInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "minimax",
    order: 50,
    handler: applyAuthChoiceMiniMax,
  });
}
