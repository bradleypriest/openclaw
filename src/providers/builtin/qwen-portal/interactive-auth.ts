import type {
  ApplyAuthChoiceParams,
  ApplyAuthChoiceResult,
} from "../../../commands/auth-choice.apply.js";
import { applyAuthChoicePluginProvider } from "../../../commands/auth-choice.apply.plugin-provider.js";

export async function applyAuthChoiceQwenPortal(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  return await applyAuthChoicePluginProvider(params, {
    authChoice: "qwen-portal",
    pluginId: "qwen-portal-auth",
    providerId: "qwen-portal",
    methodId: "device",
    label: "Qwen",
  });
}
