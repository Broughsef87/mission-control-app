import { NextRequest, NextResponse } from 'next/server';
import { getPendingApprovals, resolveApproval } from '@/lib/db';

export async function GET() {
  try {
    const data = await getPendingApprovals();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !['approved', 'denied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await resolveApproval(id, status);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
