import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabase = Boolean(url && key);

// Only constructed when configured; the mock backend is used otherwise.
export const supabase = hasSupabase
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } })
  : (null as never);
