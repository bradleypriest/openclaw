import { isOpenRouterModernModelId } from "../openrouter/live-models.js";

export function isOpenCodeModernModelId(id: string): boolean {
  if (id.endsWith("-free")) {
    return false;
  }
  if (id === "alpha-glm-4.7") {
    return false;
  }
  return isOpenRouterModernModelId(id);
}
