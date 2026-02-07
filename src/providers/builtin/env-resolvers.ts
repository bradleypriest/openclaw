import { registerGoogleVertexEnvApiKeyResolver } from "./google-vertex/runtime.js";

let registered = false;

export function ensureBuiltinProviderEnvApiKeyResolversRegistered(): void {
  if (registered) {
    return;
  }
  registerGoogleVertexEnvApiKeyResolver();
  registered = true;
}
