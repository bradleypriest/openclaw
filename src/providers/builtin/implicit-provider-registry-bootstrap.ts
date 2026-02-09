import { resolveCloudflareAiGatewayImplicitProviders } from "./cloudflare-ai-gateway/models.js";
import { registerBuiltinImplicitProviderResolvers } from "./implicit-provider-registry-core.js";
import { resolveMinimaxImplicitProviders } from "./minimax/implicit-provider.js";
import { resolveMoonshotImplicitProviders } from "./moonshot/models.js";
import { resolveOllamaImplicitProviders } from "./ollama/implicit-provider.js";
import { resolveQianfanImplicitProviders } from "./qianfan/models.js";
import { resolveQwenPortalImplicitProviders } from "./qwen-portal/implicit-provider.js";
import { resolveSyntheticImplicitProviders } from "./synthetic/models.js";
import { resolveVeniceImplicitProviders } from "./venice/models.js";
import { resolveXiaomiImplicitProviders } from "./xiaomi/models.js";

let registered = false;

export function ensureBuiltinImplicitProviderResolversRegistered(): void {
  if (registered) {
    return;
  }

  registerBuiltinImplicitProviderResolvers([
    { id: "minimax", priority: 100, resolve: resolveMinimaxImplicitProviders },
    { id: "moonshot", priority: 200, resolve: resolveMoonshotImplicitProviders },
    { id: "synthetic", priority: 300, resolve: resolveSyntheticImplicitProviders },
    { id: "venice", priority: 400, resolve: resolveVeniceImplicitProviders },
    { id: "qwen-portal", priority: 500, resolve: resolveQwenPortalImplicitProviders },
    { id: "xiaomi", priority: 600, resolve: resolveXiaomiImplicitProviders },
    {
      id: "cloudflare-ai-gateway",
      priority: 700,
      resolve: resolveCloudflareAiGatewayImplicitProviders,
    },
    { id: "ollama", priority: 800, resolve: resolveOllamaImplicitProviders },
    { id: "qianfan", priority: 900, resolve: resolveQianfanImplicitProviders },
  ]);

  registered = true;
}
