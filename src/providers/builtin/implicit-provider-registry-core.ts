import type {
  BuiltinImplicitProviderResolver,
  BuiltinImplicitProviderResolverRegistration,
} from "./implicit-types.js";

const implicitProviderResolvers = new Map<string, BuiltinImplicitProviderResolverRegistration>();

function orderRegistrations(
  registrations: BuiltinImplicitProviderResolverRegistration[],
): BuiltinImplicitProviderResolverRegistration[] {
  const ordered: BuiltinImplicitProviderResolverRegistration[] = [];
  for (const registration of registrations) {
    const index = ordered.findIndex(
      (entry) =>
        registration.priority < entry.priority ||
        (registration.priority === entry.priority && registration.id.localeCompare(entry.id) < 0),
    );
    if (index === -1) {
      ordered.push(registration);
      continue;
    }
    ordered.splice(index, 0, registration);
  }
  return ordered;
}

export function registerBuiltinImplicitProviderResolvers(
  registrations: BuiltinImplicitProviderResolverRegistration[],
): void {
  for (const registration of registrations) {
    if (!registration.id.trim() || implicitProviderResolvers.has(registration.id)) {
      continue;
    }
    implicitProviderResolvers.set(registration.id, registration);
  }
}

export function listRegisteredBuiltinImplicitProviderResolvers(): BuiltinImplicitProviderResolver[] {
  return orderRegistrations([...implicitProviderResolvers.values()]).map(
    (registration) => registration.resolve,
  );
}

export function listRegisteredBuiltinImplicitProviderResolverRegistrations(): BuiltinImplicitProviderResolverRegistration[] {
  return orderRegistrations([...implicitProviderResolvers.values()]);
}
