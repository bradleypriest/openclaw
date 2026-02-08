import type { ApplyAuthChoiceHandler } from "../../../commands/auth-choice.apply.js";
import { ensureBuiltinInteractiveAuthHandlersRegistered } from "./interactive-handler-bootstrap.js";
import { listBuiltinInteractiveAuthHandlers } from "./interactive-handler-registry-core.js";

export function getBuiltinInteractiveAuthHandlers(): ApplyAuthChoiceHandler[] {
  ensureBuiltinInteractiveAuthHandlersRegistered();
  return listBuiltinInteractiveAuthHandlers();
}
