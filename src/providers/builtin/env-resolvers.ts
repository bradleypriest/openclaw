import { registerBuiltinEnvApiKeyResolvers } from "./env-resolver-registry.js";

let registered = false;

export function ensureBuiltinProviderEnvApiKeyResolversRegistered(): void {
  if (registered) {
    return;
  }
  registerBuiltinEnvApiKeyResolvers();
  registered = true;
}
