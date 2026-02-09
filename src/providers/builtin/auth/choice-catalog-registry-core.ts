import type { AuthChoice } from "./onboard-types.js";

export type BuiltinAuthChoiceCatalogEntry = {
  choice: AuthChoice;
  providerId: string;
  label: string;
  hint?: string;
  groupId: string;
  groupLabel: string;
  groupHint?: string;
  interactiveOnly?: boolean;
  selectable?: boolean;
};

const entriesByChoice = new Map<AuthChoice, BuiltinAuthChoiceCatalogEntry>();
const entries: BuiltinAuthChoiceCatalogEntry[] = [];

export function registerBuiltinAuthChoiceCatalogEntries(
  registrations: BuiltinAuthChoiceCatalogEntry[],
): void {
  for (const entry of registrations) {
    if (entriesByChoice.has(entry.choice)) {
      continue;
    }
    entriesByChoice.set(entry.choice, entry);
    entries.push(entry);
  }
}

export function listRegisteredBuiltinAuthChoiceCatalogEntries(): BuiltinAuthChoiceCatalogEntry[] {
  return [...entries];
}

export function resolveRegisteredBuiltinPreferredProviderForAuthChoice(
  choice: AuthChoice,
): string | undefined {
  return entriesByChoice.get(choice)?.providerId;
}

export function isRegisteredBuiltinInteractiveOnlyAuthChoice(choice: AuthChoice): boolean {
  return entriesByChoice.get(choice)?.interactiveOnly === true;
}
