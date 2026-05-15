import { createBrowserClient } from "@supabase/ssr";

let _supabase: ReturnType<typeof createBrowserClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase = typeof window !== "undefined" ? getSupabase() : (null as unknown as ReturnType<typeof createBrowserClient>);

export function getSupabaseClient() {
  return getSupabase();
}

export async function getCurrentSession() {
  return getSupabase().auth.getSession();
}

export async function getCurrentUser() {
  return getSupabase().auth.getUser();
}

export async function signOut() {
  return getSupabase().auth.signOut();
}
