# FixLoop Initial Plan

## Summary

**FixLoop** is a lightweight maintenance toolkit for web apps.

Its purpose is simple:

- users can report bugs and UX issues easily
- reports are stored in a structured format
- a coding agent can fetch those reports and use them together with IDE code context to suggest or implement fixes for developer approval

Core flow:

```text
User report -> database -> safe retrieval -> agent review/fix -> developer approval
```

## MVP Goal

Build one strong path for production maintenance:

1. Add a report button to a web app
2. Let the user submit a structured issue report
3. Store the report in Supabase
4. Let an IDE or CLI agent fetch project issues through a safe API
5. Let the developer approve or reject the proposed fix

## Product Shape

FixLoop should be built as a small monorepo with reusable npm packages:

```text
packages/
  core/
  widget/
  server/
  storage-supabase/
```

## Package Roles

- `core`: shared types, validation, issue schema, storage interfaces
- `widget`: embeddable report button and form for web apps
- `server`: ingestion and safe agent-facing retrieval API
- `storage-supabase`: Supabase schema, migrations, and storage adapter

## Architecture Principles

- Supabase-first, but not locked to Supabase forever
- keep user input untrusted and validated
- keep the agent as a first-class consumer
- keep the integration path easy for existing apps
- optimize for approval-based maintenance, not autonomous production changes

## Scope

Included in MVP:

- issue reporting widget
- shared report schema
- Supabase storage
- safe retrieval for agents
- basic issue statuses

Not included in MVP:

- dashboards
- advanced analytics
- multiple official backend adapters
- fully autonomous fixing

## Positioning

**FixLoop** turns user-reported issues into agent-ready fixes.
