# Task: Make Model Providers Fully Pluggable

## Problem

The plugin system supports `api.registerProvider()` for runtime auth flows, but the CLI onboarding/setup wizard is entirely hardcoded. Every new provider (xAI, DeepSeek, Venice, etc.) requires changes to 7+ core files. This creates a massive PR bottleneck — there are 30+ open PRs just to add providers.

The typical install flow is:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
# → installs openclaw via npm
# → runs `openclaw onboard` (the wizard)
# → wizard asks "Choose a provider" — only built-in providers appear
```

A user whose only API key is for xAI has no way to proceed without xAI being built into core. That's why every provider submits a core PR.

## Solution

Two connected changes:

### 1. Declarative Provider Auth via Plugin Manifests

The 80% case for new providers is "API key + env var + default model." This should be declarative in `openclaw.plugin.json`:

```json
{
  "id": "xai-provider",
  "name": "xAI (Grok)",
  "providers": ["xai"],
  "providerAuth": {
    "xai": {
      "label": "xAI (Grok)",
      "hint": "API key",
      "method": "api-key",
      "envVars": ["XAI_API_KEY"],
      "defaultModel": "xai/grok-2-latest",
      "profileId": "xai:default",
      "keyPrompt": "Enter xAI API key"
    }
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

The onboarding wizard dynamically discovers installed plugin providers and handles them via a generic API key handler. No per-provider code needed.

### 2. Inline Plugin Install During Onboarding

The onboarding wizard gains an "Install community provider..." option that lets users paste an npm package name. The wizard installs the plugin inline, reads the manifest, and continues with the auth flow:

```
? Choose a provider:
    Anthropic (Claude)
    OpenAI
    Google (Gemini)
    ...built-ins...
    ────────────────
  ❯ Install community provider...

? Enter npm package name: @openclaw/xai
  → Installing @openclaw/xai...
  → Found: xAI (Grok)

? Enter xAI API key: xai-abc123
  ✓ Default model set to xai/grok-2-latest
```

This also works non-interactively via install.sh:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --provider @openclaw/xai
```

Or directly:

```bash
openclaw onboard --install-provider @openclaw/xai --token xai-abc123
```

This means `openclaw plugins install` must work **before** a gateway exists — it just needs to download an npm package to `~/.openclaw/extensions/`. No running gateway required.

## Key Files to Understand

1. `src/commands/auth-choice-options.ts` — hardcoded `AuthChoiceGroupId` union + `AUTH_CHOICE_GROUP_DEFS` array that drives the wizard choices
2. `src/commands/auth-choice.apply.ts` — static dispatch chain for applying auth choices
3. `src/commands/auth-choice.apply.api-providers.ts` — ~500 lines of nearly identical API key flows (OpenRouter, Moonshot, Kimi, Gemini, Venice, Synthetic, etc.)
4. `src/commands/auth-choice.apply.plugin-provider.ts` — ALREADY EXISTS for plugin-registered providers, but only handles runtime, not onboarding
5. `src/commands/onboard-types.ts` — hardcoded `AuthChoice` union + `OnboardOptions`
6. `src/agents/model-auth.ts` — hardcoded env var mapping (`xai: "XAI_API_KEY"`, etc.)
7. `src/commands/auth-choice.preferred-provider.ts` — static preferred-provider lookup
8. `src/commands/onboard-auth.ts` — provider-specific config/credential helpers
9. `src/plugins/types.ts` — `ProviderPlugin` types
10. `src/wizard/onboarding.ts` — the onboarding wizard flow
11. `src/commands/auth-choice-prompt.ts` — the provider picker UI
12. `src/cli/program/register.onboard.ts` — CLI flag registration for onboard command
13. `src/commands/onboard-non-interactive/local/auth-choice.ts` — non-interactive auth choice handling

## Design Goals

1. **Extend the plugin manifest** (`openclaw.plugin.json`) with `providerAuth` — auth method, env var names, default model, display label/group, hint text
2. **Extract the generic API key pattern** from `auth-choice.apply.api-providers.ts` into a single reusable handler driven by manifest data
3. **Dynamic wizard discovery** — `buildAuthChoiceOptions()` merges plugin-provided providers with built-in ones
4. **Inline plugin install** — the provider picker offers "Install community provider..." which does `npm install` to `~/.openclaw/extensions/`, reads the manifest, then continues
5. **Env var auto-discovery** — `resolveEnvApiKey()` in `model-auth.ts` checks plugin manifests too
6. **Non-interactive support** — `--install-provider <npm-package> --token <key>` works during onboarding
7. **Pre-gateway plugin install** — `openclaw plugins install` works without a running gateway (just downloads to extensions dir)
8. **Backward compatible** — all existing built-in providers keep working unchanged

## Migration: Consolidate Existing Providers

Once the declarative system works, migrate the existing simple API key providers in `auth-choice.apply.api-providers.ts` to use it. This file is ~500 lines of nearly identical code for 12+ providers. Each one follows the same pattern:

1. Check for CLI token flag
2. Check env var
3. Prompt for API key
4. Store in auth profile
5. Apply provider config + default model

These should all route through the same generic declarative handler. The provider-specific config (env var name, profile ID, default model, etc.) should be extracted into data — either internal manifest-style declarations or a simple registry object — so the handler is written once and the per-provider code collapses to a few lines of config each.

**Candidates for migration** (all simple API key flows):

- OpenRouter
- Vercel AI Gateway
- Cloudflare AI Gateway
- Moonshot (+ .cn variant)
- Kimi Coding
- Gemini (API key path)
- Z.AI
- Xiaomi
- Synthetic
- Venice
- OpenCode Zen

Complex flows (OAuth, device code, multi-step) stay as-is:

- Anthropic (OAuth)
- OpenAI (OAuth + API key)
- GitHub Copilot (device code)
- Google Antigravity (OAuth)
- Google Gemini CLI (OAuth)
- Qwen Portal (OAuth)
- MiniMax (OAuth + portal)

The goal: `auth-choice.apply.api-providers.ts` shrinks from ~500 lines to a small dispatcher + data declarations.

## Constraints

- Don't break existing providers
- Keep the changes minimal and clean
- OAuth/device-code flows can stay as code in register functions
- The simple API key case should be fully declarative (no code needed in the plugin)
- Respect the existing code style and patterns
- Make the actual code changes in this repo, don't just write docs
- Run `pnpm build` and `pnpm test` to verify your changes compile and pass

## Output

Make the actual code changes in this worktree. Commit when done with a clear commit message.
Focus on clean, minimal, well-tested implementation.
