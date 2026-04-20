import { NextResponse } from 'next/server';
import { getTickets, getTicketMessages, createTicket, addTicketMessage, updateTicketStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const companyId = searchParams.get('company_id') ?? undefined;
    const ticketId = searchParams.get('ticket_id');

    if (ticketId) {
      const messages = await getTicketMessages(ticketId);
      return NextResponse.json(messages);
    }

    const data = await getTickets(status, companyId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.ticket_id) {
      await addTicketMessage(body.ticket_id, body.role ?? 'human', body.content);
      return NextResponse.json({ ok: true });
    }
    const data = await createTicket(body);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    await updateTicketStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
