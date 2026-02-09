import type { AuthChoice } from "./onboard-types.js";
import { ensureBuiltinAuthChoiceCatalogRegistered } from "./choice-catalog-registry-bootstrap.js";
import {
  isRegisteredBuiltinInteractiveOnlyAuthChoice,
  listRegisteredBuiltinAuthChoiceCatalogEntries,
  resolveRegisteredBuiltinPreferredProviderForAuthChoice,
  type BuiltinAuthChoiceCatalogEntry,
} from "./choice-catalog-registry-core.js";

export type { BuiltinAuthChoiceCatalogEntry };

export const BUILTIN_AUTH_CHOICE_CATALOG: BuiltinAuthChoiceCatalogEntry[] = (() => {
  ensureBuiltinAuthChoiceCatalogRegistered();
  return listRegisteredBuiltinAuthChoiceCatalogEntries();
})();

export function resolveBuiltinPreferredProviderForAuthChoice(
  choice: AuthChoice,
): string | undefined {
  ensureBuiltinAuthChoiceCatalogRegistered();
  return resolveRegisteredBuiltinPreferredProviderForAuthChoice(choice);
}

export function isBuiltinInteractiveOnlyAuthChoice(choice: AuthChoice): boolean {
  ensureBuiltinAuthChoiceCatalogRegistered();
  return isRegisteredBuiltinInteractiveOnlyAuthChoice(choice);
}

export function listBuiltinAuthChoiceCatalogEntries(): BuiltinAuthChoiceCatalogEntry[] {
  ensureBuiltinAuthChoiceCatalogRegistered();
  return listRegisteredBuiltinAuthChoiceCatalogEntries();
}
