# Supabase Setup

Browser widget credentials:
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL`
- `NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY`

CLI credentials:
- `AGENTIC_FIX_LOOP_SUPABASE_URL`
- `AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY`

Apply the SQL files in order:
- `01_problem_reports.sql`
- `02_problem_reports_policies.sql`

The anon key is only used for insert operations guarded by RLS.
