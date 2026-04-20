# Next.js Integration

## Install

Install the widget package in your host app when it is published or linked locally.

### Published npm packages

```bash
npm install @hansimb/fix-loop-widget
npm install --save-dev @hansimb/fix-loop-cli
```

Recommended host-project script:

```json
{
  "scripts": {
    "fixloop:pull": "node --env-file=.env.development ./node_modules/@hansimb/fix-loop-cli/dist/index.js pull"
  }
}
```

### Local package link before publish

If you are developing against a local `agentic-fix-loop` checkout, use a `file:` dependency first:

```json
{
  "dependencies": {
    "@hansimb/fix-loop-widget": "file:../../agentic-fix-loop/packages/widget"
  }
}
```

Then run:

```bash
npm install
```

## Configure

Set these environment variables:

- `AGENTIC_FIX_LOOP_PROJECT_NAME`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`

If you also want to run the local CLI pull flow before npm publish, add:

- `AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY`

The same service role key is also required for the published CLI package when you run `npm run fixloop:pull`.

## Render The Widget

### Option 1: Fast Floating Install

Use the shortest supported integration path:

```tsx
import { AgenticFixLoop } from "@hansimb/fix-loop-widget";

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

### Option 2: Embedded Trigger For Production Layouts

If you want to control placement separately, use the provider, modal, and trigger pieces directly:

```tsx
import {
  AgenticFixLoopProvider,
  ReportProblemButton,
  ReportProblemModal,
} from "@hansimb/fix-loop-widget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AgenticFixLoopProvider projectName="MiniMRP">
          {children}
          <footer>
            <ReportProblemButton mode="embedded" appearance="text">
              Report a problem
            </ReportProblemButton>
          </footer>
          <ReportProblemModal />
        </AgenticFixLoopProvider>
      </body>
    </html>
  );
}
```

Recommended rule of thumb:
- use `AgenticFixLoop` for internal/admin tools
- use embedded trigger mode for storefronts and polished production frontends

### Trigger Options

`ReportProblemButton` supports:
- `mode="floating"` or `mode="embedded"`
- `appearance="solid"` or `appearance="text"`
- `position="bottom-right"` or `position="bottom-left"` for floating mode
