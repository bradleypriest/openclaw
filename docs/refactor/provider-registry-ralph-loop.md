# Provider Registry Ralph Loop

This loop is a repeatable execution pattern for the provider registry project. It uses the Ralph iteration model to deliver small, testable slices until the spec is complete.

## Inputs

- Spec: `/refactor/provider-registry-spec`
- Plan: `/refactor/provider-registry-plan`
- Baseline branch: `main`

## Prerequisites

- `jq` installed (`brew install jq` on macOS).
- Ralph tool available (external repo or Claude marketplace).

## Loop Setup

### Option A: Use Ralph repo

```bash
mkdir -p scripts/ralph
cp /path/to/ralph/ralph.sh scripts/ralph/ralph.sh
cp /path/to/ralph/CLAUDE.md scripts/ralph/CLAUDE.md
chmod +x scripts/ralph/ralph.sh
```

### Option B: Use Claude marketplace

```
/plugin marketplace add snarktank/ralph
/plugin install ralph-skills@ralph-marketplace
```

## Ralph Loop Workflow

### 1) Create PRD

Create a PRD that mirrors the spec and plan.

- File: `tasks/prd-provider-registry.md`
- Ensure each story can be completed in one iteration.
- Acceptance criteria must include tests or checks.

### 2) Convert PRD to `prd.json`

Use the Ralph skill to convert the PRD into `prd.json`.

### 3) Run Ralph

```bash
./scripts/ralph/ralph.sh 10
```

Ralph will:

1. Create a feature branch from PRD `branchName`.
2. Pick the highest priority incomplete story.
3. Implement it and run checks.
4. Commit and mark the story as `passes: true`.
5. Repeat until all stories pass.

## Recommended Test Gates

Use these gates in PRD acceptance criteria:

- `pnpm lint`
- `pnpm build`
- `pnpm vitest run <targeted tests>`

Targeted tests for this project:

- `src/commands/onboard-auth.test.ts`
- `src/commands/auth-choice.test.ts`
- `src/commands/onboard-non-interactive.provider-auth.test.ts`
- `src/agents/model-auth.test.ts`
- `src/commands/models.list.test.ts`

## Suggested `prd.json` Skeleton

```json
{
  "project": "Provider Registry",
  "branchName": "spike/provider-registry",
  "userStories": [
    {
      "id": "registry-core",
      "title": "Add ProviderRegistry core API",
      "priority": 1,
      "passes": false,
      "acceptanceCriteria": [
        "ProviderRegistry exposes registerProvider/resolveProvider/listProviders",
        "Duplicate ids emit diagnostics and ignore later registration",
        "Unit tests cover registry core"
      ]
    },
    {
      "id": "configpatch-guard",
      "title": "Restrict provider configPatch surface",
      "priority": 2,
      "passes": false,
      "acceptanceCriteria": [
        "Only models.providers.<id>, models.mode, agents.defaults.models are allowed",
        "Invalid keys emit diagnostics",
        "Tests cover allowed/disallowed patches"
      ]
    },
    {
      "id": "plugin-adapter",
      "title": "Adapter for plugin provider API",
      "priority": 3,
      "passes": false,
      "acceptanceCriteria": [
        "Existing plugin providers register without changes",
        "defaultModel + configPatch still work",
        "Compatibility tests green"
      ]
    },
    {
      "id": "core-provider-batch-1",
      "title": "Migrate OpenAI + Anthropic to ProviderRegistry",
      "priority": 4,
      "passes": false,
      "acceptanceCriteria": [
        "Providers register via configBlock",
        "Onboarding/auth tests green",
        "No behavior regression"
      ]
    }
  ]
}
```

## Progress Tracking

Ralph writes learnings to `progress.txt`. Keep each entry short and actionable:

- “ProviderRegistry diagnostics use map to avoid ordering.”
- “configPatch validator rejects non-model keys.”
- “Plugin provider adapter must keep defaultModel behavior.”

## Exit Criteria

- All stories in `prd.json` have `passes: true`.
- Registry coverage tests pass.
- Plugin provider API remains backward compatible.
