import type { AuthChoice } from "../auth/onboard-types.js";
import type { BuiltinNonInteractiveApiKeySpec } from "./types.js";
import { ensureBuiltinApiKeySpecsRegistered } from "./spec-registry-bootstrap.js";
import {
  listRegisteredBuiltinNonInteractiveApiKeySpecs,
  resolveRegisteredBuiltinApiKeyAuthChoiceByProvider,
  resolveRegisteredBuiltinNonInteractiveApiKeySpecByAuthChoice,
} from "./spec-registry-core.js";

export function listBuiltinNonInteractiveApiKeySpecs(): BuiltinNonInteractiveApiKeySpec[] {
  ensureBuiltinApiKeySpecsRegistered();
  return listRegisteredBuiltinNonInteractiveApiKeySpecs();
}

export function resolveBuiltinNonInteractiveApiKeySpecByAuthChoice(
  authChoice: AuthChoice,
): BuiltinNonInteractiveApiKeySpec | undefined {
  ensureBuiltinApiKeySpecsRegistered();
  return resolveRegisteredBuiltinNonInteractiveApiKeySpecByAuthChoice(authChoice);
}

export function resolveBuiltinApiKeyAuthChoiceByProvider(
  providerRaw?: string,
): AuthChoice | undefined {
  ensureBuiltinApiKeySpecsRegistered();
  return resolveRegisteredBuiltinApiKeyAuthChoiceByProvider(providerRaw);
}
