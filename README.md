# agentic-fix-loop

`agentic-fix-loop` is a small reusable feedback loop for web apps.

It gives you:
- a plug-and-play report button and modal for production apps
- a centralized Supabase intake database
- a tiny CLI that exports open reports into `reported-problems.md`

## Fast Path

1. Install the widget package in your app.
2. Set your project name and Supabase public credentials.
3. Render:

```tsx
<AgenticFixLoop projectName="MiniMRP" />
```

4. Later, pull the open reports locally:

```bash
npx fixloop pull
```

If you do not pass `--output`, the CLI writes `reported-problems.md`.

## Environment Variables

Widget:
- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`

CLI:
- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `AGENTIC_FIX_LOOP_SUPABASE_URL`
- `AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY`

## Repository Layout

- `packages/widget`: report button, modal, validation, metadata collection, Supabase insert flow
- `packages/cli`: `fixloop pull` command and Markdown export
- `supabase`: schema and RLS policies
- `docs`: setup and workflow docs
- `examples/nextjs`: minimal host-app integration example
