import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Returns public Supabase config for client-side use
// Safe to expose — anon key is designed to be public
export async function GET() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return NextResponse.json({ url, key });
}
