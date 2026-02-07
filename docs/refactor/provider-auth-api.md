---
summary: "Final provider auth API contract for onboarding, plugin providers, and built in providers"
read_when:
  - Designing provider auth behavior for plugin and built in providers
  - Implementing onboarding and models auth flows
title: "Provider Auth Final API"
---

# Provider Auth Final API

This page documents the final provider auth API after the pluggable onboarding and declarative auth refactor.

## Design goals

- Keep provider behavior explicit and predictable.
- Avoid hidden behavior from file presence.
- Keep onboarding UX simple for users.
- Keep provider additions low friction for maintainers.
- Keep one shared pipeline for most API key providers.

## Final behavior summary

- `api.registerProvider(...)` is the source of truth for provider auth behavior.
- Provider auth choices are derived from registered providers and methods.
- Manifest metadata can enrich registered methods, but manifest only entries do not create provider auth choices.
- Canonical plugin auth choice format is `plugin:<pluginId>:<providerId>:<method>`.
- Legacy `plugin-auth:<...>` is not supported.
- API key persistence uses shared `writeApiKeyCredential(...)`.

## User facing setup APIs

### Interactive wizard

- Run `openclaw onboard`.
- In auth selection, users can choose `Install community provider...`.
- Flow:
  - enter npm package
  - plugin installs to `~/.openclaw/extensions/`
  - registered API key auth methods are discovered
  - wizard continues directly into auth

### Non interactive onboarding

Primary flags:

- `--provider <provider-id|npm-package:provider-id>`
- `--api-key <key>`

Compatibility alias:

- `--token-provider <id>` remains as alias for `--provider`

Token flow:

- `--auth-choice token --provider anthropic --token <token>`

Examples:

```bash
openclaw onboard --non-interactive --accept-risk \
  --provider xai \
  --api-key "$XAI_API_KEY"
```

```bash
openclaw onboard --non-interactive --accept-risk \
  --provider @acme/openclaw-provider:acme \
  --api-key "$ACME_API_KEY"
```

```bash
openclaw onboard --non-interactive --accept-risk \
  --auth-choice token \
  --provider anthropic \
  --token "$ANTHROPIC_SETUP_TOKEN"
```

## Plugin provider registration model

### Registration is explicit

- A plugin must call `api.registerProvider(...)`.
- Provider auth options are derived from registered auth methods.
- Manifest data alone does not enable provider auth behavior.

### Auth method metadata for onboarding

For `kind: "api_key"`, include metadata directly on the auth method when possible:

- `authChoice`
- `envVars`
- `profileId`
- `keyPrompt`
- `defaultModel`
- `group`, `groupLabel`, `groupHint`

These fields let onboarding and non interactive auth use the same provider definition.

### Plugin example

```ts
api.registerProvider({
  id: "acme",
  label: "AcmeAI",
  auth: [
    {
      id: "api-key",
      kind: "api_key",
      label: "Acme API key",
      hint: "Bring your own key",
      authChoice: "plugin:acme-provider:acme:api-key",
      envVars: ["ACME_API_KEY"],
      profileId: "acme:default",
      keyPrompt: "Enter Acme API key",
      defaultModel: "acme/opus-1",
      group: "acme",
      groupLabel: "AcmeAI",
      run: async (ctx) => {
        const key = String(await ctx.prompter.text({ message: "Enter Acme API key" })).trim();
        return {
          profiles: [
            {
              profileId: "acme:default",
              credential: { type: "api_key", provider: "acme", key },
            },
          ],
          defaultModel: "acme/opus-1",
        };
      },
    },
  ],
});
```

### OAuth and custom methods

OAuth, device code, token, and custom providers continue to work through `run(ctx)`.

- return `profiles` to persist credentials
- return optional `configPatch` to add provider or model config
- return optional `defaultModel` for default model selection

## Built in provider model

Built in providers use declarative spec maps consumed by shared pipelines.

- Interactive apply path uses shared built in API key spec handling.
- Non interactive apply path uses shared built in API key spec handling.
- Special cases remain narrow hooks, for example Cloudflare Account ID and Gateway ID context.

### Shared credential writer

API key persistence should use one shared writer:

- `writeApiKeyCredential({ providerId, profileId, key, metadata?, agentDir? })`

This replaces provider specific setter wrappers.

### Shared env var candidate resolver

Provider API key env var candidates are centralized and reused by auth lookup:

- built in aliases and common env vars
- optional plugin metadata env vars

## Internal provider registration and model wiring

For built in providers, model registration and provider config are applied via shared config patch helpers.

- Provider config is added under `models.providers.<providerId>`.
- Model references are added under `agents.defaults.models`.
- Primary model is set under `agents.defaults.model.primary` when selected.

For plugin providers, model wiring is usually returned by auth method `run(ctx)` via `configPatch` and `defaultModel`.

## Add a new provider

### Add a new plugin provider

1. Register provider in plugin code via `api.registerProvider`.
2. Add one or more auth methods (`api_key`, `oauth`, `device_code`, `token`, `custom`).
3. For API key methods, include onboarding metadata fields listed above.
4. Return `profiles` and optional `configPatch` or `defaultModel` from `run(ctx)`.
5. If publishing externally, ensure plugin package is installable via `openclaw plugins install`.

### Add a new built in API key provider

1. Add a spec entry in built in declarative provider maps.
2. Add provider env var candidates if needed.
3. Add or reuse config patch helpers for provider and default model behavior.
4. Add targeted tests for interactive and non interactive auth apply.

## Important rules

- No provider auth from manifest only definitions.
- No legacy `plugin-auth` choice prefix.
- Use shared credential write path for API key persistence.
- Keep provider specific exceptions isolated to narrow hooks.
- Prefer declarative metadata over bespoke branching.

## Related docs

- [CLI](/cli)
- [Plugin](/plugin)
- [OpenRouter](/providers/openrouter)

## Built-in Provider Contract

- Built-ins should be represented as declarative specs consumed by shared auth apply paths.
- Provider-specific exceptions should be narrow hooks (example: Cloudflare account and gateway context).

## Validation Rules

- No provider auth options from manifest-only definitions.
- No legacy `plugin-auth` auth choices.
- Non-interactive API key setup uses shared flow and shared credential writer.
