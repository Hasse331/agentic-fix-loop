# Agent Workflow

## Published CLI Target

The developer or IDE agent runs:

```bash
npx fixloop pull
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
npx fixloop pull
```

UI integration can now use either:
- the fast floating `<AgenticFixLoop projectName="..."/>` path
- the embedded provider + modal + trigger path for footer/help-link style production placement

Optional overrides:

```bash
npx fixloop pull --project SomeOtherProject --output triage.md
```

## Local Development Before Publish

Before the CLI is published to npm, `npx fixloop pull` will fail with `404` because npm cannot find the package yet.

In local development, run the built CLI directly from the `agentic-fix-loop` repository:

```bash
node --env-file=.env.development ../../agentic-fix-loop/packages/cli/dist/index.js pull
```

Run that command from the host project root. Adjust the relative path if your repository layout is different.

Required local environment variables:
- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY`

Optional convenience improvement:
- add a host-project script such as `"fixloop:pull": "node --env-file=.env.development ../../agentic-fix-loop/packages/cli/dist/index.js pull"`
