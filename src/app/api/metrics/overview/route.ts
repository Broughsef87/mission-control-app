import { NextResponse } from 'next/server';
import { getLatestMetrics, getRevenueMTD, getAgentCostSummary, getAgentStatuses } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [platformMetrics, revenueMTD, agentCosts, agentStatuses] = await Promise.all([
      getLatestMetrics(),
      getRevenueMTD(),
      getAgentCostSummary(),
      getAgentStatuses(),
    ]);

    const activeAgents = agentStatuses.filter(a => a.status === 'Working').length;
    const totalAgents = agentStatuses.length;
    const totalAICostMTD = Object.values(agentCosts).reduce((s, v) => s + v.cost, 0);

    return NextResponse.json({
      revenue: revenueMTD,
      platform: platformMetrics,
      agents: { active: activeAgents, total: totalAgents, statuses: agentStatuses },
      ai: { costMTD: totalAICostMTD },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
