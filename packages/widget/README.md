# @hansimb/fix-loop-widget

Reusable React widget for collecting anonymous problem reports into Supabase.

## Install

```bash
npm install @hansimb/fix-loop-widget
```

## Basic Usage

```tsx
import { AgenticFixLoop } from "@hansimb/fix-loop-widget";

export function App() {
  return <AgenticFixLoop projectName="MiniMRP" />;
}
```

## Required Environment Variables

```env
AGENTIC_FIX_LOOP_PROJECT_NAME=MiniMRP
NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY=your-anon-key
```

## Composable Usage

```tsx
import {
  AgenticFixLoopProvider,
  ReportProblemButton,
  ReportProblemModal,
} from "@hansimb/fix-loop-widget";
```

Use the provider plus embedded trigger when you want the button in a footer, menu, or some other custom location.
