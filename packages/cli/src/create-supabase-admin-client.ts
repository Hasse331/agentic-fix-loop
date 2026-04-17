import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url =
    process.env.AGENTIC_FIX_LOOP_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL;
  const serviceRoleKey = process.env.AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin configuration. Set AGENTIC_FIX_LOOP_SUPABASE_URL and AGENTIC_FIX_LOOP_SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
