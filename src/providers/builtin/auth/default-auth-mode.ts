import type { BuiltinDefaultAuthMode } from "../descriptor-types.js";
import { resolveBuiltinProviderAuthAttributes } from "./provider-auth-attributes.js";

export type { BuiltinDefaultAuthMode };

export function resolveBuiltinDefaultAuthMode(
  provider: string,
): BuiltinDefaultAuthMode | undefined {
  return resolveBuiltinProviderAuthAttributes(provider)?.defaultAuthMode;
}
