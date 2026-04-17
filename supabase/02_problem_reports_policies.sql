alter table public.problem_reports enable row level security;

drop policy if exists "public_can_insert_problem_reports" on public.problem_reports;
create policy "public_can_insert_problem_reports"
on public.problem_reports
for insert
to anon
with check (true);
