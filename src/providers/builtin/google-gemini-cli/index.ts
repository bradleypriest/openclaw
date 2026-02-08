import { registerBuiltinInteractiveAuthHandler } from "../auth/interactive-handler-registry-core.js";
import { applyAuthChoiceGoogleGeminiCli } from "./interactive-auth.js";

export function registerGoogleGeminiCliInteractiveAuthHandlers(): void {
  registerBuiltinInteractiveAuthHandler({
    id: "google-gemini-cli",
    order: 80,
    handler: applyAuthChoiceGoogleGeminiCli,
  });
}
