import { registerProviderImageModelExecutionHandlers } from "./image-model-execution-registry-core.js";
import { minimaxUnderstandImage } from "./minimax-vlm.js";

let registered = false;

export function ensureProviderImageModelExecutionHandlersRegistered(): void {
  if (registered) {
    return;
  }

  registerProviderImageModelExecutionHandlers([
    {
      providerId: "minimax",
      execute: async (params) =>
        await minimaxUnderstandImage({
          apiKey: params.apiKey,
          prompt: params.prompt,
          imageDataUrl: params.imageDataUrl,
          modelBaseUrl: params.model.baseUrl,
        }),
    },
  ]);

  registered = true;
}
