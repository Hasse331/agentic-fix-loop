# Agent Workflow

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
