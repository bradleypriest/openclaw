import type { OpenClawConfig } from "../config/config.js";
import { resolveBuiltinDefaultAuthMode } from "../providers/builtin/auth/default-auth-mode.js";
import {
  BUILTIN_IMPLICIT_BEDROCK_PROVIDER_ID,
  BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID,
  resolveBuiltinImplicitBedrockProvider,
  resolveBuiltinImplicitCopilotProvider,
  resolveBuiltinImplicitProviders,
} from "../providers/builtin/implicit-providers.js";
import { ensureBuiltinProviderModelNormalizersRegistered } from "../providers/builtin/model-normalizer-registry.js";
import { buildXiaomiProviderConfig as buildBuiltinXiaomiProvider } from "../providers/builtin/xiaomi/models.js";
import { normalizeModelIdForProvider } from "../providers/model-normalizers.js";
import { normalizeProviderId } from "../providers/provider-id.js";
import { ensureAuthProfileStore, listProfilesForProvider } from "./auth-profiles.js";
import { resolveAwsSdkEnvVarName, resolveEnvApiKey } from "./model-auth.js";

type ModelsConfig = NonNullable<OpenClawConfig["models"]>;
export type ProviderConfig = NonNullable<ModelsConfig["providers"]>[string];
export { BUILTIN_IMPLICIT_BEDROCK_PROVIDER_ID, BUILTIN_IMPLICIT_COPILOT_PROVIDER_ID };

function normalizeApiKeyConfig(value: string): string {
  const trimmed = value.trim();
  const match = /^\$\{([A-Z0-9_]+)\}$/.exec(trimmed);
  return match?.[1] ?? trimmed;
}

function resolveEnvApiKeyVarName(provider: string): string | undefined {
  const resolved = resolveEnvApiKey(provider);
  if (!resolved) {
    return undefined;
  }
  const match = /^(?:env: |shell env: )([A-Z0-9_]+)$/.exec(resolved.source);
  return match ? match[1] : undefined;
}

function resolveAwsSdkApiKeyVarName(): string {
  return resolveAwsSdkEnvVarName() ?? "AWS_PROFILE";
}

function resolveApiKeyFromProfiles(params: {
  provider: string;
  store: ReturnType<typeof ensureAuthProfileStore>;
}): string | undefined {
  const ids = listProfilesForProvider(params.store, params.provider);
  for (const id of ids) {
    const cred = params.store.profiles[id];
    if (!cred) {
      continue;
    }
    if (cred.type === "api_key") {
      return cred.key;
    }
    if (cred.type === "token") {
      return cred.token;
    }
  }
  return undefined;
}

export function normalizeGoogleModelId(id: string): string {
  ensureBuiltinProviderModelNormalizersRegistered();
  return normalizeModelIdForProvider("google", id);
}

function normalizeProviderModels(providerId: string, provider: ProviderConfig): ProviderConfig {
  if (!Array.isArray(provider.models) || provider.models.length === 0) {
    return provider;
  }
  let mutated = false;
  const models = provider.models.map((model) => {
    const nextId = normalizeModelIdForProvider(providerId, model.id);
    if (nextId === model.id) {
      return model;
    }
    mutated = true;
    return { ...model, id: nextId };
  });
  return mutated ? { ...provider, models } : provider;
}

export function normalizeProviders(params: {
  providers: ModelsConfig["providers"];
  agentDir: string;
}): ModelsConfig["providers"] {
  const { providers } = params;
  if (!providers) {
    return providers;
  }
  const authStore = ensureAuthProfileStore(params.agentDir, {
    allowKeychainPrompt: false,
  });
  ensureBuiltinProviderModelNormalizersRegistered();
  let mutated = false;
  const next: Record<string, ProviderConfig> = {};

  for (const [key, provider] of Object.entries(providers)) {
    const normalizedKey = key.trim();
    const normalizedProviderId = normalizeProviderId(normalizedKey);
    let normalizedProvider = provider;

    // Fix common misconfig: apiKey set to "${ENV_VAR}" instead of "ENV_VAR".
    if (
      normalizedProvider.apiKey &&
      normalizeApiKeyConfig(normalizedProvider.apiKey) !== normalizedProvider.apiKey
    ) {
      mutated = true;
      normalizedProvider = {
        ...normalizedProvider,
        apiKey: normalizeApiKeyConfig(normalizedProvider.apiKey),
      };
    }

    // If a provider defines models, pi's ModelRegistry requires apiKey to be set.
    // Fill it from the environment or auth profiles when possible.
    const hasModels =
      Array.isArray(normalizedProvider.models) && normalizedProvider.models.length > 0;
    if (hasModels && !normalizedProvider.apiKey?.trim()) {
      const authMode =
        normalizedProvider.auth ?? resolveBuiltinDefaultAuthMode(normalizedProviderId);
      if (authMode === "aws-sdk") {
        const apiKey = resolveAwsSdkApiKeyVarName();
        mutated = true;
        normalizedProvider = { ...normalizedProvider, apiKey };
      } else {
        const fromEnv = resolveEnvApiKeyVarName(normalizedProviderId);
        const fromProfiles = resolveApiKeyFromProfiles({
          provider: normalizedProviderId,
          store: authStore,
        });
        const apiKey = fromEnv ?? fromProfiles;
        if (apiKey?.trim()) {
          mutated = true;
          normalizedProvider = { ...normalizedProvider, apiKey };
        }
      }
    }

    const providerModelNormalized = normalizeProviderModels(
      normalizedProviderId,
      normalizedProvider,
    );
    if (providerModelNormalized !== normalizedProvider) {
      mutated = true;
      normalizedProvider = providerModelNormalized;
    }

    next[key] = normalizedProvider;
  }

  return mutated ? next : providers;
}

export function buildXiaomiProvider(): ProviderConfig {
  return buildBuiltinXiaomiProvider();
}

export async function resolveImplicitProviders(params: {
  agentDir: string;
}): Promise<ModelsConfig["providers"]> {
  const authStore = ensureAuthProfileStore(params.agentDir, {
    allowKeychainPrompt: false,
  });
  return await resolveBuiltinImplicitProviders({
    authStore,
    listProfileIdsForProvider: (provider) => listProfilesForProvider(authStore, provider),
    resolveEnvApiKeyVarName,
    resolveApiKeyFromProfiles: (provider) =>
      resolveApiKeyFromProfiles({ provider, store: authStore }),
  });
}

export async function resolveImplicitCopilotProvider(params: {
  agentDir: string;
  env?: NodeJS.ProcessEnv;
}): Promise<ProviderConfig | null> {
  const authStore = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
  return await resolveBuiltinImplicitCopilotProvider({
    env: params.env,
    authStore,
    listProfileIdsForProvider: (provider) => listProfilesForProvider(authStore, provider),
  });
}

export async function resolveImplicitBedrockProvider(params: {
  agentDir: string;
  config?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
}): Promise<ProviderConfig | null> {
  return await resolveBuiltinImplicitBedrockProvider({
    config: params.config,
    env: params.env,
    hasAwsCreds: (env) => resolveAwsSdkEnvVarName(env) !== undefined,
  });
}
