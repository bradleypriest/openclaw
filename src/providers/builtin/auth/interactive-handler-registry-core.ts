import type { ApplyAuthChoiceHandler } from "../../../commands/auth-choice.apply.js";

type InteractiveAuthHandlerRegistration = {
  id: string;
  order: number;
  handler: ApplyAuthChoiceHandler;
};

const interactiveAuthHandlers = new Map<string, InteractiveAuthHandlerRegistration>();

export function registerBuiltinInteractiveAuthHandler(
  registration: InteractiveAuthHandlerRegistration,
): void {
  if (interactiveAuthHandlers.has(registration.id)) {
    return;
  }
  interactiveAuthHandlers.set(registration.id, registration);
}

export function listBuiltinInteractiveAuthHandlers(): ApplyAuthChoiceHandler[] {
  return [...interactiveAuthHandlers.values()]
    .toSorted((a, b) => a.order - b.order)
    .map((entry) => entry.handler);
}
