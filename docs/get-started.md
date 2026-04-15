# FixLoop Get Started

This guide shows how to use FixLoop in another repo from start to finish.

FixLoop is currently best used as a **local toolkit repo** next to your app. It is ready for a first real integration, but it is **not yet a published npm package**.

## What FixLoop Does

FixLoop gives you this flow:

```text
User opens report modal
-> submits a structured issue
-> issue is stored in Supabase
-> your IDE / CLI agent fetches the issue
-> agent uses issue data + code context to suggest or implement a fix
-> you approve or reject the change
```

The report structure is designed for agent repair, not just generic feedback.

---

## Current Best Installation Model

Right now, the easiest and safest way to use FixLoop is:

1. clone this repo locally
2. place it next to your app repo
3. import FixLoop files directly from source
4. wire it to your app's API and frontend

### Recommended folder structure

```text
projects/
  fixloop/
  my-app/
```

In this setup:

- FixLoop repo path = `../fixloop`
- your app repo path = `./my-app`

---

## Before You Start

You need:

- your app repo
- a Supabase project
  This can be your app's existing Supabase or a dedicated one just for FixLoop
- a server-side place in your app for API routes
- a frontend page or layout where you want to mount the report modal

---

## Step 1: Clone FixLoop Next to Your App

Example:

```bash
cd C:\Users\IMBERI\Desktop\dev\projects2

git clone <your-fixloop-repo-url> fixloop
```

After that, your structure should look roughly like:

```text
projects2/
  fixloop/
  my-app/
```

If the repo already exists locally, you do not need to clone again.

---

## Step 2: Apply the Supabase Schema

Open this file:

- [packages/storage-supabase/src/schema.sql](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/storage-supabase/src/schema.sql)

Run that SQL in your Supabase SQL editor.

This creates:

- schema: `fixloop`
- table: `fixloop.issues`

Important fields include:

- `type`
- `title`
- `route`
- `actions_before_issue`
- `actual_behavior`
- `expected_behavior`
- `description`
- `metadata`
- `status`

This is the storage layer for user issue reports.

---

## Step 3: Add FixLoop API Routes to Your App

You need two routes in your app:

- `POST /api/fixloop/reports`
- `GET /api/fixloop/issues`

These routes let:

- your frontend submit reports
- your agent fetch issues later

### Example for a Next.js app

Create a route handler like this in your app:

`app/api/fixloop/[...path]/route.js`

```js
import { createFixLoopServer } from '../../../../fixloop/packages/server/src/index.js';
import { createSupabaseStorageAdapter } from '../../../../fixloop/packages/storage-supabase/src/index.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const fixLoopServer = createFixLoopServer({
  storage: createSupabaseStorageAdapter({
    client: supabase,
    schema: 'fixloop',
    table: 'issues',
  }),
});

export async function POST(request) {
  return fixLoopServer.handle(new Request('https://fixloop.local/reports', request));
}

export async function GET(request) {
  const url = new URL(request.url);
  return fixLoopServer.handle(new Request(`https://fixloop.local/issues${url.search}`, request));
}
```

### Required environment variables

Your app needs:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only
- do not expose it to the browser

### If you are not using Next.js

The same logic still applies.

You only need to:

1. create a server-side Supabase client
2. create a FixLoop server instance
3. map incoming requests to `/reports` and `/issues`
4. return `fixLoopServer.handle(...)`

---

## Step 4: Mount the FixLoop Modal in Your Frontend

FixLoop now includes a working vanilla JS modal.

Import it from:

- [packages/widget/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/widget/src/index.js)

### Basic usage

```js
import { createFixLoopModal } from '../../../fixloop/packages/widget/src/index.js';

const fixLoopModal = createFixLoopModal({
  projectId: 'my-app',
  endpoint: '/api/fixloop/reports',
  environment: process.env.NODE_ENV,
  getRoute: () => window.location.pathname,
  getCurrentUrl: () => window.location.href,
  getMetadata: () => ({
    browser: navigator.userAgent,
  }),
});

fixLoopModal.mount();
```

This gives you:

- a report button
- a modal with open/close behavior
- form submit to your FixLoop API
- route auto-fill
- agent-ready report fields

### Where to mount it

For a first integration, mount it in:

- your root layout
- a shared app shell
- a common page wrapper

That way the report button is available broadly across the app.

---

## Step 5: What the Modal Collects

The modal collects the fields that matter for agent-assisted repair:

- `type`
  `bug` or `ux_issue`
- `title`
  short summary
- `route`
  exact current route
- `actionsBeforeIssue`
  what the user did right before the issue
- `actualBehavior`
  what happened
- `expectedBehavior`
  what should have happened
- `description`
  extra detail
- `location`
  optional UI location hint
- `severity`
  optional urgency hint

This is much more useful to an agent than vague feedback like “checkout broken”.

---

## Step 6: How Reports Reach the Database

The full path is:

```text
Frontend modal
-> POST /api/fixloop/reports
-> FixLoop server validation
-> Supabase adapter
-> fixloop.issues table
```

Validation happens in:

- [packages/core/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/core/src/index.js)

Server routing happens in:

- [packages/server/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/server/src/index.js)

Supabase persistence happens in:

- [packages/storage-supabase/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/storage-supabase/src/index.js)

---

## Step 7: Test the First Report Manually

After mounting the modal and adding the API route:

1. open your app in the browser
2. click the FixLoop report button
3. submit a bug report
4. open Supabase table editor or SQL query view
5. confirm a row appears in `fixloop.issues`

Good first checks:

- `route` is correct
- `type` is `bug` or `ux_issue`
- `actions_before_issue` is filled
- `actual_behavior` is filled
- `expected_behavior` is filled
- `metadata` contains browser/current URL if you passed them in

---

## Step 8: Fetch Issues for Your Agent

Once reports are being stored, your IDE / CLI agent can use:

```text
GET /api/fixloop/issues?projectId=my-app&status=ready_for_agent
```

Example flow:

1. open your app codebase in IDE
2. fetch issues from FixLoop
3. give issue data + current code context to the coding agent
4. let agent suggest or implement fix
5. approve or reject the result

That is the core FixLoop maintenance loop.

---

## Step 9: Suggested First Production-Like Flow

If you want the simplest practical rollout, do this in order:

1. clone FixLoop next to your app
2. apply `schema.sql`
3. add the two API routes
4. mount the modal in your app shell
5. submit one real test issue
6. verify the issue appears in Supabase
7. fetch that issue from `/api/fixloop/issues`
8. use your IDE agent to inspect and solve it

---

## Copy-Paste Quick Start Checklist

```text
[ ] Clone FixLoop next to my app
[ ] Run FixLoop schema.sql in Supabase
[ ] Add POST /api/fixloop/reports
[ ] Add GET /api/fixloop/issues
[ ] Mount createFixLoopModal() in frontend
[ ] Submit one test bug
[ ] Verify row in fixloop.issues
[ ] Fetch issue via API
[ ] Use issue in IDE agent workflow
```

---

## Important Limitations Right Now

FixLoop is ready for **first internal usage**, but not yet a polished npm package.

Current limitations:

- packages are still being used from source paths
- no published npm release yet
- modal styling is still minimal
- auth and read-access controls should be hardened before wider usage
- framework-specific examples are still limited

---

## If You Want a Real npm Package Later

Yes, this can become a real npm package set.

That next step would include:

- package dependency cleanup
- publish-ready exports
- versioning
- proper install flow like `npm install @fixloop/widget`
- cleaner framework examples

But for now, the correct way to start is the local side-by-side repo setup described above.

---

## Files You Will Use First

- [packages/core/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/core/src/index.js)
- [packages/server/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/server/src/index.js)
- [packages/widget/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/widget/src/index.js)
- [packages/storage-supabase/src/index.js](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/storage-supabase/src/index.js)
- [packages/storage-supabase/src/schema.sql](C:/Users/IMBERI/Desktop/dev/projects2/agentic-maintainance-toolkit/packages/storage-supabase/src/schema.sql)
