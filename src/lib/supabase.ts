import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

// Proxy that returns null when env vars are missing (build-time safe)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    if (!client) {
      // Return a no-op function that resolves to empty data
      return () => Promise.resolve({ data: null, error: new Error('Supabase not configured') });
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

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
