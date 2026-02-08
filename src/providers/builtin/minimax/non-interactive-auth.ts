import type { AuthChoice } from "../../../commands/onboard-types.js";
import type { OpenClawConfig } from "../../../config/config.js";
import { applyMinimaxConfig } from "./config.js";

export function applyMiniMaxNonInteractiveAuthChoice(params: {
  authChoice: AuthChoice;
  nextConfig: OpenClawConfig;
}): OpenClawConfig | undefined {
  if (params.authChoice !== "minimax") {
    return undefined;
  }
  return applyMinimaxConfig(params.nextConfig);
}
