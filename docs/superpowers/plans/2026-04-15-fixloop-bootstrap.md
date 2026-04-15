# FixLoop Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap FixLoop as a working zero-dependency npm monorepo with a validated core domain package, a safe HTTP server package, a browser-facing widget package, and a Supabase-first storage adapter.

**Architecture:** The repo uses native ESM and Node's built-in test runner so the first version works without installing external dependencies. `core` owns the domain model and validation, `server` exposes fetch-compatible handlers around a storage adapter, `widget` provides embeddable browser helpers for report submission, and `storage-supabase` translates the storage contract to a Supabase client.

**Tech Stack:** JavaScript ESM, Node.js built-in test runner, Fetch API, browser DOM helpers, Supabase-compatible adapter contract

---

## File Structure

- Root: `package.json`, `.gitignore`, `README.md`
- Docs: `docs/initial-project-plan.md`, `docs/superpowers/plans/2026-04-15-fixloop-bootstrap.md`
- Core: `packages/core/src/index.js`, `packages/core/test/core.test.js`
- Server: `packages/server/src/index.js`, `packages/server/test/server.test.js`
- Widget: `packages/widget/src/index.js`, `packages/widget/test/widget.test.js`
- Storage: `packages/storage-supabase/src/index.js`, `packages/storage-supabase/src/schema.sql`, `packages/storage-supabase/test/storage-supabase.test.js`

### Task 1: Bootstrap Repository
- [ ] Add root workspace metadata and package manifests
- [ ] Add root docs for package purpose and local usage

### Task 2: Core Package
- [ ] Write failing tests for report validation, normalization, and agent-facing shaping
- [ ] Run tests and confirm failure
- [ ] Implement minimal core behavior
- [ ] Re-run tests until green

### Task 3: Server Package
- [ ] Write failing tests for report ingestion and issue retrieval
- [ ] Run tests and confirm failure
- [ ] Implement minimal request handler around the core package
- [ ] Re-run tests until green

### Task 4: Widget Package
- [ ] Write failing tests for widget markup, payload creation, and submission helper
- [ ] Run tests and confirm failure
- [ ] Implement minimal browser-facing widget helpers
- [ ] Re-run tests until green

### Task 5: Storage Supabase Package
- [ ] Write failing tests for Supabase adapter write/read behavior
- [ ] Run tests and confirm failure
- [ ] Implement adapter and starter SQL schema
- [ ] Re-run tests until green

### Task 6: Final Verification
- [ ] Add usage documentation
- [ ] Run full test suite
- [ ] Note follow-up gaps clearly
