import { NextResponse } from 'next/server';
import { getTodayCheckin, getCheckin } from '@/lib/parseCheckin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const checkin = date ? getCheckin(date) : getTodayCheckin();
    return NextResponse.json(checkin);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
