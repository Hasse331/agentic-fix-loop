# Next.js Integration

## Install

Install the widget package in your host app when it is published or linked locally.

## Configure

Set these environment variables:

- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`

## Render The Widget

Use the shortest supported integration path:

```tsx
import { AgenticFixLoop } from "@agentic-fix-loop/widget";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AgenticFixLoop projectName="MiniMRP" />
      </body>
    </html>
  );
}
```

If you want to control placement separately, use `AgenticFixLoopProvider` and `ReportProblemButton`.
