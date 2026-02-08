import type { AuthChoice } from "../auth/onboard-types.js";
import type { BuiltinInteractiveApiKeySpec } from "./types.js";
import { ensureBuiltinApiKeySpecsRegistered } from "./spec-registry-bootstrap.js";
import {
  listRegisteredBuiltinInteractiveApiKeySpecs,
  resolveRegisteredBuiltinAuthChoiceByTokenProvider,
  resolveRegisteredBuiltinInteractiveApiKeySpecByAuthChoice,
} from "./spec-registry-core.js";

export function listBuiltinInteractiveApiKeySpecs(): BuiltinInteractiveApiKeySpec[] {
  ensureBuiltinApiKeySpecsRegistered();
  return listRegisteredBuiltinInteractiveApiKeySpecs();
}

export function resolveBuiltinInteractiveApiKeySpecByAuthChoice(
  authChoice: string,
): BuiltinInteractiveApiKeySpec | undefined {
  ensureBuiltinApiKeySpecsRegistered();
  return resolveRegisteredBuiltinInteractiveApiKeySpecByAuthChoice(authChoice);
}

export function resolveBuiltinAuthChoiceByInteractiveTokenProvider(
  tokenProviderRaw?: string,
): AuthChoice | undefined {
  ensureBuiltinApiKeySpecsRegistered();
  return resolveRegisteredBuiltinAuthChoiceByTokenProvider(tokenProviderRaw);
}
