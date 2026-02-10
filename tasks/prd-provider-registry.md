# Provider Registry PRD

## Summary

Create a unified provider registry for core and plugin providers so adding or maintaining providers is explicit, centralized, and backward compatible with the existing plugin provider API. The registry must constrain provider-driven config updates and avoid folding in unrelated domain registries.

## Goals

- Single, clear provider registration API for core and plugins.
- Preserve existing plugin provider auth flows without breaking changes.
- Centralize provider metadata and onboarding in core.
- Restrict provider config patches to model/provider configuration.
- Add tests that enforce coverage and compatibility.

## Non Goals

- No provider override/priority system yet.
- No runtime model policy hooks for plugins yet.
- Do not merge domain registries (tts, web search, media understanding, memory search, image tooling) into provider registry.

## Background

Core providers have grown a fragmented set of registries and provider-specific logic. Plugins can register auth methods but cannot participate in a centralized provider surface. This leads to inconsistent provider onboarding and makes plugin providers less viable as an alternative to core changes.

## Requirements

1. Introduce `ProviderRegistry` with `registerProvider`, `resolveProvider`, `listProviders`.
2. Maintain backward compatibility with existing plugin `api.registerProvider` (auth-only surface).
3. Restrict `configPatch` to:
   - `models.providers.<id>`
   - `models.mode`
   - `agents.defaults.models`
4. Provide derived views for existing internal callers (auth choice catalog, env vars, api-key specs, runtime tags). Legacy/deprecation warnings remain in `doctor-auth` until a later migration.
5. Migrate core providers gradually without behavior regressions.
6. Add registry coverage tests and plugin compatibility tests.

## Success Criteria

- Plugin providers work unchanged after registry introduction.
- Core providers register via registry and no longer depend on scattered special cases.
- configPatch rejects non-provider/model keys with diagnostics.
- All targeted tests pass and coverage tests enforce provider registration.

## Next Stage Scope

- Make registry authoritative for OpenAI/Anthropic auth choices and env-var detection (remove static duplicates).
- Rename registry metadata to avoid `auth` naming collisions (`descriptor` -> `internal`, `descriptor.auth` -> `internal.authSignals`).
- Drive OpenAI/Anthropic auth-choice execution from registry handler ids and remove dedicated apply modules.

## User Stories (high-level)

1. As a plugin author, I can register a provider using the existing auth API and have it work without changes.
2. As a core maintainer, I can add a provider by creating a single registration block.
3. As a user, onboarding a provider updates only model/provider config and cannot modify unrelated settings.
4. As a maintainer, I can verify provider registry coverage with tests.

## Out of Scope

- Provider ordering and override semantics.
- Plugin-provided runtime model hooks.
- Domain registry refactors for tts/search/media/image.
