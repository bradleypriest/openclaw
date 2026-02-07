import { getEnvApiKey } from "@mariozechner/pi-ai";
import { registerProviderEnvApiKeyResolver } from "../../auth-env-vars.js";

export const GOOGLE_VERTEX_PROVIDER_ID = "google-vertex";

export function registerGoogleVertexEnvApiKeyResolver(): void {
  registerProviderEnvApiKeyResolver(GOOGLE_VERTEX_PROVIDER_ID, () => {
    const envKey = getEnvApiKey(GOOGLE_VERTEX_PROVIDER_ID);
    if (!envKey) {
      return null;
    }
    return { apiKey: envKey, source: "gcloud adc" };
  });
}
