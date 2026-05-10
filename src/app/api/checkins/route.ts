import { NextResponse } from 'next/server';
import { getCheckinByDate } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    const row = await getCheckinByDate(date);
    if (!row) return NextResponse.json({ date, exists: false, content: null });
    return NextResponse.json({ date, exists: true, content: row.content, row });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
