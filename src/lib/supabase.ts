import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _adminClient: SupabaseClient | null = null;

// Anon client — used for browser/auth flows
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!_client) _client = createClient(url, key);
  return _client;
}

// Admin client — uses service role key, bypasses RLS, server-side only
export function getSupabaseAdmin(): SupabaseClient {
  // SUPABASE_URL (no NEXT_PUBLIC_) is a pure runtime env var — always available server-side
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
  if (!url) throw new Error('Missing SUPABASE_URL env var');
  if (!_adminClient) _adminClient = createClient(url, key, { auth: { persistSession: false } });
  return _adminClient;
}

// Legacy anon export (used by client components / auth flows)
export const supabase = {
  get auth() { return getSupabaseClient().auth; },
  from: (table: string) => getSupabaseClient().from(table),
  channel: (name: string) => getSupabaseClient().channel(name),
  removeChannel: (channel: any) => getSupabaseClient().removeChannel(channel),
};

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
