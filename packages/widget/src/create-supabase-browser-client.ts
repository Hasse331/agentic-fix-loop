import { createClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_AGENTIC_FIX_LOOP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Agentic Fix Loop public Supabase configuration");
  }

  return createClient(url, key);
}
