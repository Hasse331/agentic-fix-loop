# Agentic Fix Loop Design

## Summary

`agentic-fix-loop` is a standalone repository that provides a very small, easy-to-adopt feedback loop for web projects with a similar stack to `MiniMRP`.

Version 1 focuses on two jobs only:

1. Collect anonymous end-user problem reports from production apps through a tiny embeddable widget.
2. Let a developer or an IDE-based coding agent pull those reports into a local Markdown file with one very short command.

The project does not include its own agent, issue dashboard, or full bug lifecycle tooling in v1. It is intentionally a lightweight intake-and-export layer.

## Product Goals

- Be extremely fast to install in other projects.
- Work well for Next.js-style apps without requiring host-project backend work.
- Send reports from many apps into one centralized Supabase database.
- Keep reports anonymous while still capturing useful debugging context.
- Give developers and agents a simple pull-based workflow such as `npx fixloop pull`.

## Non-Goals For V1

- No built-in autonomous agent.
- No heavy browser-based admin dashboard.
- No screenshot upload.
- No complex project management workflow.
- No attempt to replace GitHub issues, Linear, or Jira.

## Repository Shape

The repository should start with these top-level areas:

- `packages/widget`
  Publishable npm package with the report button, modal, client-side validation, metadata capture, and Supabase insert logic.
- `packages/cli`
  Publishable or executable CLI package with a `pull` command that exports reports into Markdown.
- `supabase`
  Central database schema, policies, and setup notes.
- `docs`
  Product design, setup guides, integration examples, and agent workflow notes.
- `examples/nextjs`
  A minimal host app showing the easiest integration path.

## Core User Flow

1. A host project installs the widget package.
2. The host project adds a small config surface such as project name and Supabase public credentials.
3. The host app renders either:
   - `<AgenticFixLoop projectName="MiniMRP" />`, or
   - a provider plus modal plus a custom trigger location such as the footer.
4. A user clicks the report button.
5. A modal asks for:
   - issue type: `BUG` or `UX`
   - what they were doing
   - what happened
   - what should have happened
6. The widget automatically includes:
   - project name
   - current URL
   - timestamp
   - browser and OS information
   - viewport dimensions
7. The widget writes the report into the centralized Supabase project using the public anon key plus a strict insert-only RLS policy.
8. Later, a developer or their IDE agent runs:
   - `npx fixloop pull`
9. The CLI resolves defaults from local config or `.env`, fetches open reports for the current project, and writes `reported-problems.md` by default.

## Data Model

V1 should keep a single main table named `problem_reports`.

Recommended columns:

- `id uuid primary key`
- `created_at timestamptz not null default now()`
- `project_name text not null`
- `report_type text not null`
- `status text not null default 'open'`
- `page_url text not null`
- `what_were_you_doing text not null`
- `what_happened text not null`
- `what_should_have_happened text not null`
- `browser_name text`
- `browser_version text`
- `operating_system text`
- `viewport_width integer`
- `viewport_height integer`
- `reported_at_client timestamptz`
- `metadata_json jsonb not null default '{}'::jsonb`

Recommended constraints:

- `report_type in ('bug', 'ux')`
- `status in ('open', 'exported', 'resolved', 'ignored')`
- non-empty text validation for the three user-entered narrative fields

## Security Model

The widget uses:

- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`

This means the browser can connect directly to Supabase, but only under strict Row Level Security rules.

V1 security rules:

- Public client can `insert` into `problem_reports`.
- Public client cannot `select`, `update`, or `delete`.
- CLI reads with a server-side credential in the developer's environment.
- Service role credentials are never shipped to the browser.

This gives the easiest host-project integration while keeping the public surface narrow.

## Integration API

V1 should optimize for the all-in-one usage style:

```tsx
<AgenticFixLoop projectName="MiniMRP" />
```

The package should also expose lower-level composition pieces for later flexibility, such as:

- `AgenticFixLoopProvider`
- `ReportProblemButton`
- `ReportProblemModal`
- `useAgenticFixLoop`

The host project should not need to create custom API routes for the default path.

For production storefronts, the recommended composition pattern is:

```tsx
<AgenticFixLoopProvider projectName="MiniMRP">
  {children}
  <footer>
    <ReportProblemButton mode="embedded" appearance="text">
      Report a problem
    </ReportProblemButton>
  </footer>
  <ReportProblemModal />
</AgenticFixLoopProvider>
```

This keeps the modal and submission logic inside the package while letting the host application choose where the trigger belongs.

## CLI Experience

The CLI must be optimized for speed and memorability.

Primary command:

```bash
npx fixloop pull
```

Default behavior:

- project name is resolved automatically from local config or environment
- output path defaults to `reported-problems.md`
- only open reports are fetched
- reports are sorted newest first
- `--project` is optional
- `--output` is optional

Optional flags can exist, but they should not be required for the main path:

- `--project`
- `--output`
- `--limit`
- `--type`

That means:

- `npx fixloop pull`
  should work in the happy path with zero extra typing
- `npx fixloop pull --project SomeOtherProject`
  should make switching projects easy
- `npx fixloop pull --output triage.md`
  should still be available when needed

## Markdown Export Shape

The output should be easy for both humans and agents to scan.

Suggested shape:

```md
# Reported Problems

## 2026-04-18 09:15 - BUG - MiniMRP
- Report ID: `report-id`
- URL: `https://app.example.com/products/42`
- Browser: `Chrome 135 / Windows`
- Viewport: `1440x900`

### What were you doing?
Trying to save a product version.

### What happened?
The save action did nothing.

### What should have happened?
The product version should save and show success feedback.
```

## Why This Design

This design intentionally avoids over-building.

The biggest product value is not sophisticated triage logic. It is:

- one tiny widget
- one central database
- one short pull command

That combination makes the system practical to reuse across many projects without introducing significant maintenance burden.
