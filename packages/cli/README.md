# @hansimb/fix-loop-cli

CLI for exporting open problem reports from Supabase into Markdown.

## Install

```bash
npm install --save-dev @hansimb/fix-loop-cli
```

## Recommended Script

```json
{
  "scripts": {
    "fixloop:pull": "node --env-file=.env.development ./node_modules/@hansimb/fix-loop-cli/dist/index.js pull"
  }
}
```

Then run:

```bash
npm run fixloop:pull
```

## Required Environment Variables

```env
AGENTIC_FIX_LOOP_PROJECT_NAME=MiniMRP
NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL=https://your-project.supabase.co
AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If you do not pass `--output`, the CLI writes `reported-problems.md`.
