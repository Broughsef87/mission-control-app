import { NextRequest, NextResponse } from 'next/server';
import {
  getNotifications, createNotification,
  markNotificationRead, markAllNotificationsRead,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getNotifications();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, body: msgBody, source } = body;
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
    await createNotification({ type: type ?? 'info', title, body: msgBody, source: source ?? 'manual' });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    if (all) {
      await markAllNotificationsRead();
    } else if (id) {
      await markNotificationRead(id);
    } else {
      return NextResponse.json({ error: 'id or all=true required' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
