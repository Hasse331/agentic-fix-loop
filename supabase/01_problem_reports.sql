create extension if not exists pgcrypto;

create table if not exists public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_name text not null,
  report_type text not null check (report_type in ('bug', 'ux')),
  status text not null default 'open' check (status in ('open', 'exported', 'resolved', 'ignored')),
  page_url text not null,
  what_were_you_doing text not null check (length(trim(what_were_you_doing)) > 0),
  what_happened text not null check (length(trim(what_happened)) > 0),
  what_should_have_happened text not null check (length(trim(what_should_have_happened)) > 0),
  browser_name text,
  browser_version text,
  operating_system text,
  viewport_width integer,
  viewport_height integer,
  reported_at_client timestamptz,
  metadata_json jsonb not null default '{}'::jsonb
);
