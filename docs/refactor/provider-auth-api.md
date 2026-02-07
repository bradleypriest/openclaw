---
summary: "Provider auth API contract: explicit provider registration plus shared onboarding metadata"
read_when:
  - Designing provider auth behavior for plugins and built-ins
  - Updating onboarding and models auth flows
title: "Provider Auth API"
---

# Provider Auth API Contract

## Goals

- Keep provider behavior explicit and predictable.
- Avoid hidden behavior triggered by file presence.
- Make most providers data-first with minimal custom code.

## Runtime Authority

- `api.registerProvider(...)` is the source of truth for provider auth behavior.
- Provider auth choices are derived from registered providers and methods.
- Manifest metadata may enrich registered methods, but manifest-only entries do not create provider auth choices.

## Canonical Auth Choice Format

- Plugin provider auth choices use:
  - `plugin:<pluginId>:<providerId>:<method>`
- Legacy `plugin-auth:<...>` is not supported.

## Onboarding CLI Contract

Primary non-interactive API:

```bash
openclaw onboard --non-interactive --provider <provider-id|npm-package:provider-id> --api-key <key>
```

Token flow:

```bash
openclaw onboard --non-interactive --auth-choice token --provider anthropic --token <token>
```

Notes:

- `--token-provider` is retained as a compatibility alias to `--provider`.
- `--provider <npm-package>:<provider-id>` installs and selects provider in one step.

## Provider Registration Shape

Registered auth methods should carry onboarding metadata directly where possible.

```ts
api.registerProvider({
  id: "acme",
  label: "AcmeAI",
  auth: [
    {
      id: "api-key",
      kind: "api_key",
      label: "Acme API key",
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

## Shared Credential Write Contract

API key persistence should use one shared writer:

- `writeApiKeyCredential({ providerId, profileId, key, metadata?, agentDir? })`

This replaces provider-specific key writer wrappers.

## Built-in Provider Contract

- Built-ins should be represented as declarative specs consumed by shared auth apply paths.
- Provider-specific exceptions should be narrow hooks (example: Cloudflare account and gateway context).

## Validation Rules

- No provider auth options from manifest-only definitions.
- No legacy `plugin-auth` auth choices.
- Non-interactive API key setup uses shared flow and shared credential writer.
