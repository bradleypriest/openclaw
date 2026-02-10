# Provider Registry Plan

## Summary

Build a unified provider registry on top of `origin/main` that keeps plugin provider auth backward compatible, limits configPatch blast radius, and centralizes core provider registration without pulling in domain registries (tts, web search, media understanding, memory search, image tooling).

## Goals

- Single `registerProvider(configBlock)` entry point for core + plugin providers.
- Preserve existing plugin provider API (`api.registerProvider`) with no breaking changes.
- Constrain `configPatch` to provider/model config only.
- Migrate core providers gradually with safe checkpoints.
- Remove legacy registry surfaces only after coverage is complete.

## Non Goals

- No provider override/priority system yet.
- No plugin runtime hooks or tags beyond auth/onboarding.
- No domain registries folded into provider registry.

## Phases

### Phase 0: Inventory (read-only)

- Map existing plugin provider API in `src/plugins/types.ts` and registry behavior in `src/plugins/registry.ts`.
- Enumerate core provider surfaces:
  - Auth/onboarding flows
  - API key specs
  - Setup-token metadata
  - Runtime tags
  - Legacy profiles/advisories
- Capture current behavior tests that must remain green.

### Phase 1: Core registry scaffold

- Create `src/providers/registry.ts` with:
  - `registerProvider`, `resolveProvider`, `listProviders`
  - duplicate id diagnostics (first registration wins)
- Define `ProviderRegistration` and `ProviderConfigPatch` types.
- Add configPatch validator enforcing allowed keys:
  - `models.providers.<id>`, `models.mode`, `agents.defaults.models`
- Provide adapter functions to expose derived views for existing call sites:
  - auth choice catalog
  - api key specs
  - env var candidates
  - provider advisories
  - legacy profiles
  - runtime tags

### Phase 2: Plugin compatibility adapter

- Wire existing plugin `api.registerProvider` to call the new registry.
- Keep old plugin surface intact:
  - `auth` methods
  - `defaultModel`
  - `configPatch`
- Add diagnostics for invalid configPatch keys.
- Add tests:
  - existing plugin tests remain green
  - configPatch validation test

### Phase 3: Core provider migration (batch 1)

- Migrate two representative providers (OpenAI + Anthropic):
  - create `providerRegistration` in provider modules
  - register via the registry bootstrap
  - update derived views to read from registry
- Validate onboarding + auth flows with targeted tests.

### Phase 3.5: Registry authoritative for migrated providers

- Remove OpenAI/Anthropic auth choices from the static catalog and group defs.
- Remove OpenAI env var fallback mapping so env-var detection comes from registry.
- Update tests to ensure no duplicate choices and onboarding remains stable.

### Phase 3.6: Metadata naming cleanup

- Rename `descriptor` to `internal` and `descriptor.auth` to `internal.authSignals`.
- Update core provider registrations and derived views to use the new naming.

### Phase 3.7: Auth choice handler consolidation

- Move OpenAI/Anthropic auth-choice execution into shared handlers.
- Remove the dedicated OpenAI/Anthropic apply modules.
- Keep behavior identical with targeted auth-choice tests.

### Phase 4: Core provider migration (batch 2)

- Migrate remaining built-in providers in groups:
  - API key only providers
  - OAuth providers
  - implicit providers
- Remove provider-specific shims as each batch completes.

### Phase 5: Legacy cleanup

- Remove superseded registries if no longer referenced.
- Keep compatibility shims only if used by plugin providers or docs.
- Add coverage test ensuring each core provider registers exactly once.

### Phase 6: Docs

- Update docs to describe unified provider registry surface.
- Update plugin provider docs to clarify `configPatch` limits.

## Backward Compatibility Strategy

- Plugin `registerProvider` remains unchanged.
- Core providers migrate internally without affecting plugin providers.
- Feature parity: default models and onboarding still work as before.

## Testing Plan

- Unit tests:
  - provider registry diagnostics
  - configPatch validation
  - plugin provider compatibility
- Integration tests:
  - `src/commands/auth-choice.test.ts`
  - `src/commands/onboard-auth.test.ts`
  - `src/commands/onboard-non-interactive.*.test.ts`
  - `src/agents/model-auth.test.ts`
  - `src/commands/models.list.test.ts`

## Rollback Plan

- Registry is additive until Phase 5.
- If behavior diverges, revert to legacy registries and keep plugin adapter intact.

## Risks

- Hidden provider behavior tied to legacy registries.
- Unintended configPatch expansion.
- Partial migration causing dual sources of truth.

## Exit Criteria

- All core providers registered once via registry.
- Plugin providers work unchanged.
- ConfigPatch validator enforced.
- Legacy registries removed or fully derived from registry.
