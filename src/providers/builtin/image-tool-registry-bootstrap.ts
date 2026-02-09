import {
  resolveAnthropicCrossProviderVisionModel,
  resolveAnthropicPreferredVisionModel,
} from "./anthropic/image-tool.js";
import {
  registerBuiltinConfiguredVisionModelPickers,
  registerBuiltinCrossProviderVisionModelResolvers,
  registerBuiltinPreferredVisionModelResolvers,
} from "./image-tool-registry-core.js";
import {
  pickMiniMaxConfiguredVisionModel,
  resolveMiniMaxPreferredVisionModel,
} from "./minimax/image-tool.js";
import {
  resolveOpenAiCrossProviderVisionModel,
  resolveOpenAiPreferredVisionModel,
} from "./openai/image-tool.js";

let registered = false;

export function ensureBuiltinImageToolResolversRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinPreferredVisionModelResolvers([
    {
      id: "minimax-preferred-vision-model",
      priority: 100,
      resolve: resolveMiniMaxPreferredVisionModel,
    },
    {
      id: "configured-provider-vision-model",
      priority: 200,
      resolve: (params) =>
        params.providerHasAuth && params.providerVisionFromConfig
          ? params.providerVisionFromConfig
          : null,
    },
    {
      id: "openai-preferred-vision-model",
      priority: 300,
      resolve: resolveOpenAiPreferredVisionModel,
    },
    {
      id: "anthropic-preferred-vision-model",
      priority: 400,
      resolve: resolveAnthropicPreferredVisionModel,
    },
  ]);

  registerBuiltinConfiguredVisionModelPickers([
    {
      providerId: "minimax",
      pick: pickMiniMaxConfiguredVisionModel,
    },
  ]);

  registerBuiltinCrossProviderVisionModelResolvers([
    {
      id: "openai-cross-provider-vision-model",
      priority: 100,
      resolve: resolveOpenAiCrossProviderVisionModel,
    },
    {
      id: "anthropic-cross-provider-vision-model",
      priority: 200,
      resolve: resolveAnthropicCrossProviderVisionModel,
    },
  ]);

  registered = true;
}
