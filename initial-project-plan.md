# Agentic Fix Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone repository that provides a plug-and-play report-problem widget for web apps plus a tiny CLI that exports centralized Supabase problem reports into `reported-problems.md` by default.

**Architecture:** The repository is split into a widget package, a CLI package, Supabase schema files, and documentation/examples. The widget writes anonymous reports directly from the browser to Supabase using a tightly restricted anon-key flow, while the CLI reads reports with server-side credentials and renders a Markdown export optimized for developers and IDE agents.

**Tech Stack:** TypeScript, React, Supabase, npm workspaces, Markdown docs, SQL migrations

---

### Task 1: Bootstrap The Repository Structure

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `packages/widget/package.json`
- Create: `packages/cli/package.json`
- Create: `packages/widget/src/index.ts`
- Create: `packages/cli/src/index.ts`
- Create: `examples/nextjs/README.md`
- Create: `supabase/README.md`

- [ ] **Step 1: Create the root workspace manifest**

```json
{
  "name": "agentic-fix-loop",
  "private": true,
  "version": "0.1.0",
  "workspaces": [
    "packages/*",
    "examples/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

- [ ] **Step 2: Create shared TypeScript config**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 3: Create a focused `.gitignore`**

```gitignore
node_modules/
dist/
.env
.env.*
reported-problems.md
.DS_Store
```

- [ ] **Step 4: Add workspace package manifests**

```json
{
  "name": "@agentic-fix-loop/widget",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

```json
{
  "name": "fixloop",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "fixloop": "./dist/index.js"
  }
}
```

- [ ] **Step 5: Add initial package entry points**

```ts
export {};
```

```ts
#!/usr/bin/env node
console.log("fixloop CLI placeholder");
```

- [ ] **Step 6: Add placeholder docs for example app and Supabase setup**

```md
# Next.js Example

This example will show the shortest supported integration path for the widget package.
```

```md
# Supabase Setup

This directory will contain the centralized schema and policy files for `agentic-fix-loop`.
```

- [ ] **Step 7: Run a directory check**

Run: `Get-ChildItem -Recurse`
Expected: the repository contains `packages`, `examples`, and `supabase` with the files above

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: bootstrap agentic fix loop workspace"
```

### Task 2: Define The Shared Problem Report Contract

**Files:**
- Create: `packages/widget/src/types.ts`
- Create: `packages/cli/src/types.ts`
- Create: `docs/data-model.md`
- Test: `packages/widget/src/types.ts`

- [ ] **Step 1: Write the shared report type shape**

```ts
export type ReportType = "bug" | "ux";

export type ReportStatus = "open" | "exported" | "resolved" | "ignored";

export interface ProblemReportRecord {
  id: string;
  created_at: string;
  project_name: string;
  report_type: ReportType;
  status: ReportStatus;
  page_url: string;
  what_were_you_doing: string;
  what_happened: string;
  what_should_have_happened: string;
  browser_name: string | null;
  browser_version: string | null;
  operating_system: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  reported_at_client: string | null;
  metadata_json: Record<string, unknown>;
}
```

- [ ] **Step 2: Mirror the contract into the CLI package initially**

```ts
export type ReportType = "bug" | "ux";

export interface PullOptions {
  projectName: string;
  outputPath: string;
}
```

- [ ] **Step 3: Document the data model**

```md
# Data Model

Main table: `problem_reports`

Required fields:
- `project_name`
- `report_type`
- `page_url`
- `what_were_you_doing`
- `what_happened`
- `what_should_have_happened`

Automatic metadata:
- browser
- operating system
- viewport
- client timestamp
- JSON metadata payload
```

- [ ] **Step 4: Run TypeScript validation once the repository is wired**

Run: `npm run build`
Expected: type declarations build successfully after package build scripts exist

- [ ] **Step 5: Commit**

```bash
git add packages/widget/src/types.ts packages/cli/src/types.ts docs/data-model.md
git commit -m "docs: define shared problem report contract"
```

### Task 3: Build The Widget API Surface

**Files:**
- Create: `packages/widget/src/AgenticFixLoop.tsx`
- Create: `packages/widget/src/AgenticFixLoopProvider.tsx`
- Create: `packages/widget/src/ReportProblemButton.tsx`
- Create: `packages/widget/src/report-form-state.ts`
- Create: `packages/widget/src/index.ts`
- Test: `packages/widget/src/report-form-state.ts`

- [ ] **Step 1: Define the simplest all-in-one component API**

```tsx
export interface AgenticFixLoopProps {
  projectName: string;
  position?: "bottom-right" | "bottom-left";
  enabled?: boolean;
}
```

- [ ] **Step 2: Define the provider surface for advanced use**

```tsx
export interface AgenticFixLoopProviderProps {
  projectName: string;
  children: React.ReactNode;
}
```

- [ ] **Step 3: Define the form state contract**

```ts
export interface ReportDraft {
  reportType: "bug" | "ux";
  whatWereYouDoing: string;
  whatHappened: string;
  whatShouldHaveHappened: string;
}

export function createEmptyDraft(): ReportDraft {
  return {
    reportType: "bug",
    whatWereYouDoing: "",
    whatHappened: "",
    whatShouldHaveHappened: ""
  };
}
```

- [ ] **Step 4: Export the public API**

```ts
export { AgenticFixLoop } from "./AgenticFixLoop";
export { AgenticFixLoopProvider } from "./AgenticFixLoopProvider";
export { ReportProblemButton } from "./ReportProblemButton";
export type { AgenticFixLoopProps } from "./AgenticFixLoop";
```

- [ ] **Step 5: Add a small state test once test tooling exists**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyDraft } from "./report-form-state";

test("createEmptyDraft returns the default bug draft", () => {
  assert.deepEqual(createEmptyDraft(), {
    reportType: "bug",
    whatWereYouDoing: "",
    whatHappened: "",
    whatShouldHaveHappened: ""
  });
});
```

- [ ] **Step 6: Run the targeted test**

Run: `node --test packages/widget/src/report-form-state.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/widget/src
git commit -m "feat: define widget public api"
```

### Task 4: Implement Browser Metadata Capture And Submission

**Files:**
- Create: `packages/widget/src/collect-client-metadata.ts`
- Create: `packages/widget/src/create-supabase-browser-client.ts`
- Create: `packages/widget/src/submit-problem-report.ts`
- Test: `packages/widget/src/submit-problem-report.test.ts`

- [ ] **Step 1: Define the metadata collector output**

```ts
export interface ClientMetadata {
  pageUrl: string;
  browserName: string | null;
  browserVersion: string | null;
  operatingSystem: string | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  reportedAtClient: string;
}
```

- [ ] **Step 2: Implement the browser client factory**

```ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Agentic Fix Loop public Supabase configuration");
  }

  return createClient(url, key);
}
```

- [ ] **Step 3: Define the submit contract**

```ts
export interface SubmitProblemReportInput {
  projectName: string;
  reportType: "bug" | "ux";
  whatWereYouDoing: string;
  whatHappened: string;
  whatShouldHaveHappened: string;
}
```

- [ ] **Step 4: Implement the insert shape against `problem_reports`**

```ts
await client.from("problem_reports").insert({
  project_name: input.projectName,
  report_type: input.reportType,
  page_url: metadata.pageUrl,
  what_were_you_doing: input.whatWereYouDoing,
  what_happened: input.whatHappened,
  what_should_have_happened: input.whatShouldHaveHappened,
  browser_name: metadata.browserName,
  browser_version: metadata.browserVersion,
  operating_system: metadata.operatingSystem,
  viewport_width: metadata.viewportWidth,
  viewport_height: metadata.viewportHeight,
  reported_at_client: metadata.reportedAtClient,
  metadata_json: {}
});
```

- [ ] **Step 5: Write a submission test with a stubbed client**

```ts
import assert from "node:assert/strict";
import test from "node:test";

test("submit-problem-report maps fields into the Supabase insert payload", async () => {
  let payload: Record<string, unknown> | null = null;

  const fakeClient = {
    from() {
      return {
        async insert(nextPayload: Record<string, unknown>) {
          payload = nextPayload;
          return { error: null };
        }
      };
    }
  };

  assert.equal(typeof fakeClient.from, "function");
  assert.equal(payload, null);
});
```

- [ ] **Step 6: Run the targeted test**

Run: `node --test packages/widget/src/submit-problem-report.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/widget/src
git commit -m "feat: add widget submission flow"
```

### Task 5: Create The Supabase Schema And Policies

**Files:**
- Create: `supabase/01_problem_reports.sql`
- Create: `supabase/02_problem_reports_policies.sql`
- Modify: `supabase/README.md`
- Test: `supabase/01_problem_reports.sql`

- [ ] **Step 1: Create the table definition**

```sql
create extension if not exists pgcrypto;

create table if not exists public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_name text not null,
  report_type text not null check (report_type in ('bug', 'ux')),
  status text not null default 'open' check (status in ('open', 'exported', 'resolved', 'ignored')),
  page_url text not null,
  what_were_you_doing text not null,
  what_happened text not null,
  what_should_have_happened text not null,
  browser_name text,
  browser_version text,
  operating_system text,
  viewport_width integer,
  viewport_height integer,
  reported_at_client timestamptz,
  metadata_json jsonb not null default '{}'::jsonb
);
```

- [ ] **Step 2: Enable RLS and add the insert-only public policy**

```sql
alter table public.problem_reports enable row level security;

create policy "public_can_insert_problem_reports"
on public.problem_reports
for insert
to anon
with check (true);
```

- [ ] **Step 3: Document the credential model in `supabase/README.md`**

```md
# Supabase Setup

Browser widget credentials:
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`

CLI credential:
- `AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY`

The anon key is only used for insert operations guarded by RLS.
```

- [ ] **Step 4: Apply the schema in a Supabase project**

Run: `psql "$SUPABASE_DB_URL" -f supabase/01_problem_reports.sql`
Expected: the `problem_reports` table is created

- [ ] **Step 5: Apply the policies**

Run: `psql "$SUPABASE_DB_URL" -f supabase/02_problem_reports_policies.sql`
Expected: row level security is enabled with an insert-only anon policy

- [ ] **Step 6: Commit**

```bash
git add supabase
git commit -m "feat: add centralized problem report schema"
```

### Task 6: Build The `fixloop pull` CLI Happy Path

**Files:**
- Create: `packages/cli/src/load-project-config.ts`
- Create: `packages/cli/src/create-supabase-admin-client.ts`
- Create: `packages/cli/src/pull-command.ts`
- Create: `packages/cli/src/render-reported-problems-markdown.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/src/render-reported-problems-markdown.test.ts`

- [ ] **Step 1: Define config resolution with ergonomic defaults**

```ts
export interface ResolvedPullConfig {
  projectName: string;
  outputPath: string;
}

export function resolvePullConfig(input: {
  projectArg?: string;
  outputArg?: string;
  env?: NodeJS.ProcessEnv;
}): ResolvedPullConfig {
  const projectName =
    input.projectArg ??
    input.env?.AGENTIC_FIX_LOOP_PROJECT_NAME ??
    input.env?.NEXT_PUBLIC_AGENTIC_FIX_LOOP_PROJECT_NAME;

  if (!projectName) {
    throw new Error("Missing project name. Set AGENTIC_FIX_LOOP_PROJECT_NAME or pass --project.");
  }

  return {
    projectName,
    outputPath: input.outputArg ?? "reported-problems.md"
  };
}
```

- [ ] **Step 2: Define the Markdown renderer**

```ts
export function renderReportedProblemsMarkdown(projectName: string): string {
  return `# Reported Problems\n\nProject: ${projectName}\n`;
}
```

- [ ] **Step 3: Build the CLI entry for the short command path**

```ts
const command = process.argv[2];

if (command === "pull") {
  console.log("Running fixloop pull...");
} else {
  console.error("Unknown command");
  process.exit(1);
}
```

- [ ] **Step 4: Implement the read query shape**

```ts
const { data, error } = await client
  .from("problem_reports")
  .select("*")
  .eq("project_name", config.projectName)
  .eq("status", "open")
  .order("created_at", { ascending: false });
```

- [ ] **Step 5: Write a renderer test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { renderReportedProblemsMarkdown } from "./render-reported-problems-markdown";

test("renderReportedProblemsMarkdown includes the heading and project name", () => {
  const markdown = renderReportedProblemsMarkdown("MiniMRP");
  assert.match(markdown, /# Reported Problems/);
  assert.match(markdown, /Project: MiniMRP/);
});
```

- [ ] **Step 6: Run the CLI renderer test**

Run: `node --test packages/cli/src/render-reported-problems-markdown.test.ts`
Expected: PASS

- [ ] **Step 7: Verify the happy-path command shape**

Run: `node packages/cli/src/index.ts pull`
Expected: the command resolves config defaults and prepares to write `reported-problems.md`

- [ ] **Step 8: Commit**

```bash
git add packages/cli/src
git commit -m "feat: add fixloop pull command"
```

### Task 7: Document The Host-Project Integration

**Files:**
- Create: `README.md`
- Create: `docs/integration-nextjs.md`
- Create: `docs/agent-workflow.md`
- Modify: `docs/agentic-fix-loop-design.md`

- [ ] **Step 1: Write the root README around the shortest success path**

```md
# agentic-fix-loop

Install the widget, add your project name and Supabase public keys, render `<AgenticFixLoop projectName="MiniMRP" />`, and let users report problems. Then run `npx fixloop pull` to generate `reported-problems.md`.
```

- [ ] **Step 2: Document the Next.js integration**

```md
# Next.js Integration

1. Install the widget package.
2. Set:
   - `AGENTIC_FIX_LOOP_PROJECT_NAME`
   - `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
   - `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`
3. Render:

```tsx
<AgenticFixLoop projectName="MiniMRP" />
```
```

- [ ] **Step 3: Document the agent workflow**

```md
# Agent Workflow

The developer or IDE agent runs:

```bash
npx fixloop pull
```

If no output path is provided, the CLI writes `reported-problems.md`.
```

- [ ] **Step 4: Update the design doc with the final CLI defaulting rule**

```md
Primary command:

```bash
npx fixloop pull
```

Defaults:
- `--project` is optional
- `--output` is optional
- output defaults to `reported-problems.md`
```

- [ ] **Step 5: Review the docs for consistency**

Run: `rg "reported-problems.md|npx fixloop pull|AGENTIC_FIX_LOOP_PROJECT_NAME" docs README.md`
Expected: all docs agree on the short command path and the default output file

- [ ] **Step 6: Commit**

```bash
git add README.md docs
git commit -m "docs: add onboarding and agent workflow"
```

### Task 8: Add A Minimal Example App

**Files:**
- Create: `examples/nextjs/app/layout.tsx`
- Create: `examples/nextjs/app/page.tsx`
- Create: `examples/nextjs/package.json`
- Test: `examples/nextjs/app/layout.tsx`

- [ ] **Step 1: Create the example package manifest**

```json
{
  "name": "agentic-fix-loop-nextjs-example",
  "private": true
}
```

- [ ] **Step 2: Add the minimal layout integration**

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
        <AgenticFixLoop projectName="ExampleApp" />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Add a simple example page**

```tsx
export default function Page() {
  return <main>Example host app for Agentic Fix Loop</main>;
}
```

- [ ] **Step 4: Run a file review**

Run: `Get-Content examples/nextjs/app/layout.tsx`
Expected: the example app renders the widget in the root layout

- [ ] **Step 5: Commit**

```bash
git add examples/nextjs
git commit -m "docs: add minimal nextjs example"
```

### Task 9: Final Verification And Release Prep

**Files:**
- Modify: `README.md`
- Modify: `initial-project-plan.md`

- [ ] **Step 1: Run the full workspace build**

Run: `npm run build`
Expected: all packages build successfully

- [ ] **Step 2: Run the workspace tests**

Run: `npm test`
Expected: widget and CLI tests pass

- [ ] **Step 3: Smoke-test the CLI default output behavior**

Run: `node packages/cli/dist/index.js pull`
Expected: `reported-problems.md` is created when no `--output` flag is passed

- [ ] **Step 4: Review the repository tree**

Run: `Get-ChildItem -Recurse`
Expected: docs, packages, examples, and supabase all reflect the v1 scope only

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: prepare v1 foundation"
```
