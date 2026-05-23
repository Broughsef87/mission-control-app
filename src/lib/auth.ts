/**
 * auth.ts — Server-side auth gate for API routes.
 * Mirrors proxy.ts: bypasses for localhost / Tailscale IP / unconfigured Supabase,
 * otherwise requires a Supabase session.
 *
 * Usage in a route handler:
 *   const unauth = await requireAuth();
 *   if (unauth) return unauth;
 */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '100.75.248.115']);

function isLocalHost(host: string): boolean {
  const hostname = host.split(':')[0];
  return LOCAL_HOSTS.has(hostname) || hostname.startsWith('192.168.');
}

export async function requireAuth(): Promise<NextResponse | null> {
  const hdrs = await headers();
  const host = hdrs.get('host') || '';
  if (isLocalHost(host)) return null;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return null;
}
