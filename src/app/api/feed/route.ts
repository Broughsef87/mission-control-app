import { NextResponse } from 'next/server';
import { getBriefingFeed } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getSupabaseAdmin();

    const [briefings, checkinsRes] = await Promise.all([
      getBriefingFeed(20),
      db.from('checkins')
        .select('id, date, priorities, blocker, notes, content, created_at')
        .order('date', { ascending: false })
        .limit(20),
    ]);

    const checkinEvents = (checkinsRes.data ?? []).map((c: any) => ({
      id: c.id,
      type: 'checkin',
      title: `Check-in — ${c.date}`,
      content: c.content ?? (c.priorities ?? []).join('\n') ?? c.notes ?? '',
      created_at: c.created_at,
    }));

    const briefingEvents = briefings.map((b: any) => ({
      id: b.id,
      type: b.type ?? 'morning_brief',
      title: b.title ?? `Brief — ${new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      content: b.content,
      created_at: b.created_at,
    }));

    const all = [...briefingEvents, ...checkinEvents]
      .filter(e => e.content)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(all);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
