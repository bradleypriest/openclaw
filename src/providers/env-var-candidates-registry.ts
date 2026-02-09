import { registerVoyageProviderEnvVarCandidates } from "./voyage/env-var-candidates.js";

let registered = false;

export function ensureProviderEnvVarCandidatesRegistered(): void {
  if (registered) {
    return;
  }
  registerVoyageProviderEnvVarCandidates();
  registered = true;
}
