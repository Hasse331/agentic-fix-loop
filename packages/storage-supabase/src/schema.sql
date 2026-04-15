create schema if not exists fixloop;

create table if not exists fixloop.issues (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  type text not null,
  title text not null,
  actions_before_issue text not null,
  description text not null,
  expected_behavior text not null,
  actual_behavior text not null,
  route text not null,
  location text,
  severity text,
  environment text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists fixloop_issues_project_id_idx
  on fixloop.issues (project_id, created_at desc);
