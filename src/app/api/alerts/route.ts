import { NextRequest, NextResponse } from 'next/server';
import { getUnresolvedAlerts, createAlert } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const alerts = await getUnresolvedAlerts();
    return NextResponse.json(alerts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { severity, source, message } = await req.json();
    if (!severity || !source || !message) {
      return NextResponse.json({ error: 'severity, source, and message are required' }, { status: 400 });
    }
    if (!['critical', 'warning', 'info'].includes(severity)) {
      return NextResponse.json({ error: 'severity must be critical, warning, or info' }, { status: 400 });
    }
    const alert = await createAlert({ severity, source, message });
    return NextResponse.json(alert, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
