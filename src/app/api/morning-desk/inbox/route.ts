import { NextResponse } from 'next/server';
import { getPendingApprovals } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Inbox-of-attention scaffold.
// Compass lead intake (FOR-40) will populate the leads section when live.
// Currently surfaces: pending approvals + placeholder for Apollo-triaged leads.
export async function GET() {
  try {
    const approvals = await getPendingApprovals();

    const approvalItems = (approvals as any[]).map(a => ({
      id: a.id,
      type: 'approval' as const,
      label: a.description ?? a.task ?? 'Pending approval',
      source: a.agent_name ?? 'System',
      created_at: a.created_at,
      urgency: 'medium' as const,
    }));

    return NextResponse.json({
      configured: true,
      lead_intake_live: false,
      items: approvalItems,
      total: approvalItems.length,
      note: 'Lead intake (FOR-40) will populate this panel when live.',
      as_of: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
