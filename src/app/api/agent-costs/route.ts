import { NextResponse } from 'next/server';
import { getAgentCostSummary, getDailyCosts, getAgentLogs } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [summary, dailyCosts, recentLogs] = await Promise.all([
      getAgentCostSummary(),
      getDailyCosts(14),
      getAgentLogs(20),
    ]);

    const totalMTD = Object.values(summary).reduce((sum, v) => sum + v.cost, 0);
    const totalTokens = Object.values(summary).reduce((sum, v) => sum + v.tokens, 0);

    return NextResponse.json({ summary, dailyCosts, recentLogs, totalMTD, totalTokens });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
