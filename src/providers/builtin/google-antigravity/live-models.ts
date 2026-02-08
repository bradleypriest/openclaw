import { isAnthropicModernModelId } from "../anthropic/live-models.js";
import { isGoogleModernModelId } from "../google/live-models.js";

export function isGoogleAntigravityModernModelId(id: string): boolean {
  return isGoogleModernModelId(id) || isAnthropicModernModelId(id);
}
