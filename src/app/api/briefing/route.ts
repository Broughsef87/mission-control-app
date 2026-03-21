import { NextResponse } from 'next/server';
import { getLatestBriefing, createBriefing, getRevenueMTD, getAgentStatuses, getAgentLogs } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const briefing = await getLatestBriefing();
    if (briefing) return NextResponse.json(briefing);

    // Auto-generate a bootstrap briefing if none exists
    const [revenueMTD, agentStatuses, recentLogs] = await Promise.all([
      getRevenueMTD(),
      getAgentStatuses(),
      getAgentLogs(10),
    ]);

    const activeAgents = agentStatuses.filter(a => a.status === 'Working').map(a => a.agent_name);
    const content = `Good morning. Mission Control is online.\n\n` +
      `Revenue MTD: $${revenueMTD.total.toLocaleString()}. ` +
      `${activeAgents.length} agents currently active: ${activeAgents.join(', ')}. ` +
      `${recentLogs.length} actions logged in the last session. ` +
      `All systems nominal. Ready for today's sprint.`;

    const snapshot = { revenueMTD, agentStatuses };
    const generated = await createBriefing(content, snapshot);
    return NextResponse.json(generated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  // Force regenerate briefing
  try {
    const [revenueMTD, agentStatuses, recentLogs] = await Promise.all([
      getRevenueMTD(),
      getAgentStatuses(),
      getAgentLogs(10),
    ]);

    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const activeAgents = agentStatuses.filter(a => a.status === 'Working').map(a => a.agent_name);
    const content = `${date}. ` +
      `Revenue MTD sits at $${revenueMTD.total.toLocaleString()} across ${Object.keys(revenueMTD.byCategory).join(', ')} channels. ` +
      `${activeAgents.length} of ${agentStatuses.length} agents are active: ${activeAgents.join(', ')}. ` +
      `${recentLogs.length} actions were logged in the last session. ` +
      `Systems nominal — proceed with sprint.`;

    const snapshot = { revenueMTD, agentStatuses };
    const briefing = await createBriefing(content, snapshot);
    return NextResponse.json(briefing, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
