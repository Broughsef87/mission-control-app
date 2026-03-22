import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

function getAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key (server-side only) — bypasses RLS for API routes
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_adminClient) _adminClient = createClient(url, key, { auth: { persistSession: false } });
  return _adminClient;
}

function makeProxy(clientFn: () => SupabaseClient | null) {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const client = clientFn();
      if (!client) {
        return () => Promise.resolve({ data: null, error: new Error('Supabase not configured') });
      }
      const value = (client as any)[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    }
  });
}

// Anon client — used for browser/auth flows
export const supabase = makeProxy(getClient);

// Admin client — uses service role key, bypasses RLS, server-side API routes only
export const supabaseAdmin = makeProxy(getAdminClient);

// Types matching our schema
export interface AgentStatus {
  id: string;
  agent_name: string;
  status: string;
  location: string;
  last_seen: string;
  metadata: Record<string, unknown> | null;
}

export interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  path: string | null;
  model: string | null;
  tokens: number | null;
  cost: number | null;
  created_at: string;
}
