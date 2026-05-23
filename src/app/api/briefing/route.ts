import { NextRequest, NextResponse } from 'next/server';
import { getBriefingFeed, createBriefing, getRevenueMTD, getAgentStatuses, getAgentLogs } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const briefs = await getBriefingFeed(20);
    if (briefs && briefs.length > 0) return NextResponse.json(briefs);

    // Auto-generate a bootstrap briefing if none exists
    const [revenueMTD, agentStatuses, recentLogs] = await Promise.all([
      getRevenueMTD(),
      getAgentStatuses(),
      getAgentLogs(10),
    ]);

    const activeAgents = agentStatuses.filter(a => a.status === 'Working').map(a => a.agent_name);
    const content = `Good morning. The Foundry is online.\n\n` +
      `Revenue MTD: $${revenueMTD.total.toLocaleString()}. ` +
      `${activeAgents.length} agents currently active: ${activeAgents.join(', ')}. ` +
      `${recentLogs.length} actions logged in the last session. ` +
      `All systems nominal. Ready for today's sprint.`;

    const snapshot = { revenueMTD, agentStatuses };
    const generated = await createBriefing(content, snapshot);
    return NextResponse.json([generated]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: { title?: string; content?: string; type?: string };
    try { 
      body = await req.json(); 
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!body.content) {
      return NextResponse.json({ error: 'Missing content field in payload' }, { status: 400 });
    }

    const briefing = await createBriefing(body.content, {}, body.title, body.type);
    return NextResponse.json(briefing, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
