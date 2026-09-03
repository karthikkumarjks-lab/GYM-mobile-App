import { createClient } from "@supabase/supabase-js";

// The Supabase URL + publishable key are safe to ship in client code and public repos —
// row-level security is the security boundary, not this key. Env vars override for local
// dev (.env.local) or a different environment.
const FALLBACK_URL = "https://myogttnqpvmhvfjvdtaq.supabase.co";
const FALLBACK_KEY = "sb_publishable_1OoPOLlQKVNNvcuxLxhE2g_gz_wjE6d";

const url = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_URL;
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_KEY;

export const supabaseUrl = url;
export const functionsUrl = `${url}/functions/v1`;
export const hasSupabase = Boolean(url && key);

export const supabase = hasSupabase
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : (null as never);
