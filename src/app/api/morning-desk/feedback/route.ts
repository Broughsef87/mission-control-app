import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { signal_label, source } = await req.json();
    if (!signal_label) {
      return NextResponse.json({ error: 'signal_label required' }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    const { error } = await db
      .from('synthesis_feedback')
      .insert({ signal_label, source: source ?? null, type: 'thumbs_down' });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
