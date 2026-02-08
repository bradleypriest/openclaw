import type { AuthChoice } from "./onboard-types.js";
import { findDeclarativeProviderAuthByChoice } from "../plugins/provider-auth-manifest.js";
import { resolveBuiltinPreferredProviderForAuthChoice } from "../providers/builtin/auth/choice-catalog.js";

export function resolvePreferredProviderForAuthChoice(choice: AuthChoice): string | undefined {
  const preferred = resolveBuiltinPreferredProviderForAuthChoice(choice);
  if (preferred) {
    return preferred;
  }

  return findDeclarativeProviderAuthByChoice(choice)?.providerId;
}
