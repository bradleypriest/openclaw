import type { BuiltinProviderDescriptor } from "./descriptor-types.js";
import { ensureBuiltinProviderDescriptorsRegistered } from "./provider-descriptor-registry-bootstrap.js";
import {
  listRegisteredBuiltinProviderDescriptors,
  resolveRegisteredBuiltinProviderDescriptor,
} from "./provider-descriptor-registry-core.js";

export function listBuiltinProviderDescriptors(): BuiltinProviderDescriptor[] {
  ensureBuiltinProviderDescriptorsRegistered();
  return listRegisteredBuiltinProviderDescriptors();
}

export function resolveBuiltinProviderDescriptor(
  providerRaw?: string,
): BuiltinProviderDescriptor | undefined {
  ensureBuiltinProviderDescriptorsRegistered();
  return resolveRegisteredBuiltinProviderDescriptor(providerRaw);
}
