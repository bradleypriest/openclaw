import type {
  ApplyAuthChoiceParams,
  ApplyAuthChoiceResult,
} from "../../../commands/auth-choice.apply.js";
import { applyAuthChoicePluginProvider } from "../../../commands/auth-choice.apply.plugin-provider.js";

export async function applyAuthChoiceCopilotProxy(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  return await applyAuthChoicePluginProvider(params, {
    authChoice: "copilot-proxy",
    pluginId: "copilot-proxy",
    providerId: "copilot-proxy",
    methodId: "local",
    label: "Copilot Proxy",
  });
}
