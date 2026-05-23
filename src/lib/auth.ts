/**
 * auth.ts — Server-side auth gate for API routes.
 *
 * Posture:
 *   1. If TRUSTED_HOST env var is set AND matches the incoming Host header → bypass.
 *      Operator opts into the bypass; user-controlled Host header alone can't
 *      bypass auth (codex review: Host can be spoofed behind any proxy).
 *   2. If Supabase isn't configured → bypass (fresh-clone dev state).
 *   3. Otherwise require a Supabase session, 401 if missing.
 *
 * Usage:
 *   const unauth = await requireAuth();
 *   if (unauth) return unauth;
 */
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function requireAuth(): Promise<NextResponse | null> {
  const hdrs = await headers();
  const host = (hdrs.get('host') || '').split(':')[0];

  const trusted = process.env.TRUSTED_HOST;
  if (trusted && host === trusted) return null;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return null;
}
