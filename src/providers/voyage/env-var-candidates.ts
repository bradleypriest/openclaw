import { registerProviderEnvVarCandidates } from "../provider-env-var-candidates.js";

export function registerVoyageProviderEnvVarCandidates(): void {
  registerProviderEnvVarCandidates("voyage", ["VOYAGE_API_KEY"]);
}
