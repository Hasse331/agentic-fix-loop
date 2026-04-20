# Agent Workflow

## Published CLI Target

The developer or IDE agent runs:

```bash
npm run fixloop:pull
```

Default behavior:
- `--project` is optional
- `--output` is optional
- output defaults to `reported-problems.md`

If project name is not passed, the CLI reads it from:
- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_PROJECT_NAME`

Typical use:

```bash
npm run fixloop:pull
```

UI integration can now use either:
- the fast floating `<AgenticFixLoop projectName="..."/>` path
- the embedded provider + modal + trigger path for footer/help-link style production placement

Optional overrides:

```bash
node --env-file=.env.development ./node_modules/@hansimb/fix-loop-cli/dist/index.js pull --project SomeOtherProject --output triage.md
```

Recommended host-project script:

```json
{
  "scripts": {
    "fixloop:pull": "node --env-file=.env.development ./node_modules/@hansimb/fix-loop-cli/dist/index.js pull"
  }
}
```

## Local Development Before Publish

Before the CLI is published to npm, point that script at the local `agentic-fix-loop` repository instead:

```json
{
  "scripts": {
    "fixloop:pull": "node --env-file=.env.development ../../agentic-fix-loop/packages/cli/dist/index.js pull"
  }
}
```

Required local environment variables:
- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY`
