import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!url || !anonKey) {
    throw new Error(
      'Supabase não configurado. Defina PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY no .env.'
    );
  }
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return client;
}
