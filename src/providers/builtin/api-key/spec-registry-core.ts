import type { AuthChoice } from "../auth/onboard-types.js";
import type { BuiltinInteractiveApiKeySpec, BuiltinNonInteractiveApiKeySpec } from "./types.js";
import { normalizeProviderId } from "../../provider-id.js";

const interactiveSpecs: BuiltinInteractiveApiKeySpec[] = [];
const nonInteractiveSpecs: BuiltinNonInteractiveApiKeySpec[] = [];
const interactiveByAuthChoice = new Map<string, BuiltinInteractiveApiKeySpec>();
const nonInteractiveByAuthChoice = new Map<AuthChoice, BuiltinNonInteractiveApiKeySpec>();
const tokenProviderToAuthChoice = new Map<string, AuthChoice>();
const providerToAuthChoice: Record<string, AuthChoice> = {};

export function registerBuiltinInteractiveApiKeySpecs(specs: BuiltinInteractiveApiKeySpec[]): void {
  for (const spec of specs) {
    interactiveSpecs.push(spec);
    interactiveByAuthChoice.set(spec.authChoice, spec);
    for (const tokenProvider of spec.tokenProviders) {
      const normalizedProvider = normalizeProviderId(tokenProvider);
      if (!tokenProviderToAuthChoice.has(normalizedProvider)) {
        tokenProviderToAuthChoice.set(normalizedProvider, spec.authChoice as AuthChoice);
      }
    }
  }
}

export function registerBuiltinNonInteractiveApiKeySpecs(
  specs: BuiltinNonInteractiveApiKeySpec[],
): void {
  for (const spec of specs) {
    nonInteractiveSpecs.push(spec);
    nonInteractiveByAuthChoice.set(spec.authChoice, spec);
  }
}

export function registerBuiltinApiKeyProviderAuthChoiceAliases(
  aliases: Record<string, AuthChoice>,
): void {
  for (const [providerRaw, authChoice] of Object.entries(aliases)) {
    providerToAuthChoice[normalizeProviderId(providerRaw)] = authChoice;
  }
}

export function listRegisteredBuiltinInteractiveApiKeySpecs(): BuiltinInteractiveApiKeySpec[] {
  return interactiveSpecs;
}

export function listRegisteredBuiltinNonInteractiveApiKeySpecs(): BuiltinNonInteractiveApiKeySpec[] {
  return nonInteractiveSpecs;
}

export function resolveRegisteredBuiltinInteractiveApiKeySpecByAuthChoice(
  authChoice: string,
): BuiltinInteractiveApiKeySpec | undefined {
  return interactiveByAuthChoice.get(authChoice);
}

export function resolveRegisteredBuiltinNonInteractiveApiKeySpecByAuthChoice(
  authChoice: AuthChoice,
): BuiltinNonInteractiveApiKeySpec | undefined {
  return nonInteractiveByAuthChoice.get(authChoice);
}

export function resolveRegisteredBuiltinAuthChoiceByTokenProvider(
  tokenProviderRaw?: string,
): AuthChoice | undefined {
  const tokenProvider = tokenProviderRaw?.trim();
  if (!tokenProvider) {
    return undefined;
  }
  return tokenProviderToAuthChoice.get(normalizeProviderId(tokenProvider));
}

export function resolveRegisteredBuiltinApiKeyAuthChoiceByProvider(
  providerRaw?: string,
): AuthChoice | undefined {
  const provider = providerRaw?.trim();
  if (!provider) {
    return undefined;
  }
  return providerToAuthChoice[normalizeProviderId(provider)];
}
