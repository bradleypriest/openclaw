import { registerGoogleVertexEnvApiKeyResolver } from "./google-vertex/runtime.js";

const BUILTIN_ENV_API_KEY_RESOLVER_REGISTRARS: Array<() => void> = [
  registerGoogleVertexEnvApiKeyResolver,
];

export function registerBuiltinEnvApiKeyResolvers(): void {
  for (const register of BUILTIN_ENV_API_KEY_RESOLVER_REGISTRARS) {
    register();
  }
}
