import type { AuthChoice } from "../auth/onboard-types.js";

export const OPENAI_PROVIDER_AUTH_CHOICE_ALIASES: Record<string, AuthChoice> = {
  openai: "openai-api-key",
};
