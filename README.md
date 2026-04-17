# agentic-fix-loop

`agentic-fix-loop` is a small reusable feedback loop for web apps.

It gives you:
- a plug-and-play report button and modal for production apps
- a centralized Supabase intake database
- a tiny CLI that exports open reports into `reported-problems.md`

## Integration Modes

`fixloop` now supports two main widget styles:

- `AgenticFixLoop`
  Fast all-in-one mode that renders a floating trigger plus the modal. Good for internal tools, demos, and very quick installs.
- `AgenticFixLoopProvider` + `ReportProblemModal` + `ReportProblemButton`
  Composable mode for production frontends where the app should choose the trigger location, such as a footer, help menu, or support panel.

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

## Production-Friendly Embedded Trigger

If you do not want a floating button, render the modal once near the app root and place the trigger wherever your UI needs it:

```tsx
import {
  AgenticFixLoopProvider,
  ReportProblemButton,
  ReportProblemModal,
} from "@agentic-fix-loop/widget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgenticFixLoopProvider projectName="MiniMRP">
      {children}
      <footer>
        <ReportProblemButton mode="embedded" appearance="text">
          Report a problem
        </ReportProblemButton>
      </footer>
      <ReportProblemModal />
    </AgenticFixLoopProvider>
  );
}
```

Useful trigger options:
- `mode="floating"` for the default fixed-position button
- `mode="embedded"` for inline placement inside existing layout
- `appearance="solid"` for a pill-style button
- `appearance="text"` for a footer/help-link style trigger

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
