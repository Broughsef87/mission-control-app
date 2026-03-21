import { NextRequest, NextResponse } from 'next/server';
import { getRevenue, getRevenueMTD, createRevenue, deleteRevenue } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const summary = searchParams.get('summary') === 'true';

    if (summary) {
      const mtd = await getRevenueMTD();
      return NextResponse.json(mtd);
    }

    const data = await getRevenue();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, amount, source, category, notes } = body;
    if (!amount || !source) {
      return NextResponse.json({ error: 'amount and source are required' }, { status: 400 });
    }
    const entry = await createRevenue({
      date: date ?? new Date().toISOString().split('T')[0],
      amount: Number(amount),
      source,
      category: category ?? 'agency',
      notes,
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await deleteRevenue(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
