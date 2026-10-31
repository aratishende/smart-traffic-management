import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

/**
 * Creates the browser Supabase client only when a database operation is needed.
 * The anon/publishable key is intended for browser use and must be protected by
 * Row Level Security policies. Never use a service_role key in this application.
 */
export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
  }

  if (!client) {
    client = createClient(url, anonKey);
  }

  return client;
}
