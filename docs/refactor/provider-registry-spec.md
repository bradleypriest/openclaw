# Provider Registry Spec

## Goals

- Single provider registration API for core and plugins.
- Improve plugin viability without forcing core changes.
- Centralize provider metadata and onboarding while keeping domain registries separate.
- Preserve backward compatibility with existing plugin providers.
- Deterministic behavior without relying on registration order.

## Non Goals

- No override or priority system for providers yet.
- No runtime model policy hooks exposed to plugins yet.
- No domain systems folded into provider registry (tts, web search, media understanding, memory search).

## Registry API

```ts
registerProvider(config: ProviderRegistration): void
resolveProvider(id: string): ProviderRegistration | undefined
listProviders(): ProviderRegistration[]
```

## Provider Registration

```ts
type ProviderRegistration = {
  id: string; // canonical provider id
  label?: string; // human-readable name
  aliases?: string[];

  // Plugin compatible auth surface
  auth?: ProviderAuthDefinition[];
  defaultModel?: string;
  configPatch?: ProviderConfigPatch;

  // Core only metadata
  internal?: {
    authSignals?: {
      defaultMode?: "aws-sdk";
      envVarCandidates?: string[];
    };
    runtime?: {
      tags?: ProviderTag[];
    };
    setupToken?: {
      label: string;
      confirmMessage: string;
      tokenPrompt: string;
      methodLabel: string;
      methodHint: string;
      validateToken: (value: string) => string | undefined;
    };
  };

  // Onboarding choice catalog
  authChoices?: AuthChoiceEntry[];

  // Core only API key specs
  apiKey?: {
    interactive?: BuiltinInteractiveApiKeySpec[];
    nonInteractive?: BuiltinNonInteractiveApiKeySpec[];
    authChoiceAliases?: Record<string, AuthChoice>;
  };
};

type AuthChoiceEntry = {
  choice: string;
  providerId: string;
  label: string;
  hint?: string;
  groupId: string;
  groupLabel: string;
  groupHint?: string;
  handlerId?: string;
  interactiveOnly?: boolean;
  selectable?: boolean;
};
```

## Config Patch Constraints

`configPatch` exists today in plugin provider auth results. This spec narrows its scope to reduce blast radius.

Allowed keys only:

- `models.providers.<id>`
- `models.mode`
- `agents.defaults.models`

Any other keys should be rejected with diagnostics.

## Determinism

- No priority or ordering system.
- Duplicate provider ids emit diagnostics and later registrations are ignored.
- Deterministic behavior via map lookups only.

## Compatibility

- Existing plugin `api.registerProvider({ id, label, auth })` remains valid.
- Plugins may optionally return `defaultModel` and restricted `configPatch`.
- Plugins do not provide runtime hooks or tags yet.

## Derived Views

Existing internal registries become derived views from the provider registry:

- Auth choice catalog
- API key specs
- Env var candidates
- Legacy profile rules
- Provider advisories
- Implicit providers
- Runtime tags

These are internal implementation details, not public provider API.

## Explicit Exclusions

The following remain domain registries and are not part of provider registry:

- Image and vision tooling
- Memory search
- Web search
- TTS
- Media understanding

## Diagnostics

- Duplicate provider id should emit an error and be ignored.
- Invalid alias should emit a warning and be ignored.
- Disallowed config patch keys should emit an error.

## Migration Strategy

1. Introduce provider registry and adapter for plugin provider API.
2. Rewire core providers to register with provider registry.
3. Convert old registries to internal derived views.
4. Remove legacy paths after stabilization.

## Testing Requirements

- Provider registry coverage: every core provider registers exactly once.
- Plugin backward compatibility: existing plugins still work.
- Config patch constraint tests.
- Diagnostics tests for duplicates and invalid aliases.

## Open Decisions

- Alias collision policy (recommended: disallow).
- Whether plugins may register auth choices (recommended: allow for their own provider id).
