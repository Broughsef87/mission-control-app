import { NextResponse } from 'next/server';
import { getAgentCostSummary, getDailyCosts, getAgentLogs } from '@/lib/db';

export const dynamic = 'force-dynamic';

function weekBoundaries() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - daysToMonday);
  thisWeekStart.setHours(0, 0, 0, 0);

  const priorWeekStart = new Date(thisWeekStart);
  priorWeekStart.setDate(thisWeekStart.getDate() - 7);

  return { thisWeekStart, priorWeekStart, priorWeekEnd: thisWeekStart };
}

function sumDays(byDay: Record<string, number>, from: Date, to: Date): number {
  let total = 0;
  for (const [day, cost] of Object.entries(byDay)) {
    const d = new Date(day);
    if (d >= from && d < to) total += cost;
  }
  return total;
}

// External fees — hardcoded monthly amounts, prorated to weekly for comparison.
// Update APOLLO_MONTHLY_FEE and STRIPE_MONTHLY_FEE env vars to reflect actual plan costs.
function externalFeesWeekly() {
  const apollo = Number(process.env.APOLLO_MONTHLY_FEE ?? 0) / 4.33;
  const stripe  = Number(process.env.STRIPE_MONTHLY_FEE  ?? 0) / 4.33;
  return { apollo, stripe };
}

export async function GET() {
  try {
    const { thisWeekStart, priorWeekStart, priorWeekEnd } = weekBoundaries();

    const [summary, dailyCosts, recentLogs] = await Promise.all([
      getAgentCostSummary(),
      getDailyCosts(21), // 3 weeks of data covers both windows
      getAgentLogs(20),
    ]);

    const totalMTD   = Object.values(summary).reduce((s, v) => s + v.cost, 0);
    const totalTokens = Object.values(summary).reduce((s, v) => s + v.tokens, 0);

    const claudeThisWeek  = sumDays(dailyCosts, thisWeekStart, new Date());
    const claudePriorWeek = sumDays(dailyCosts, priorWeekStart, priorWeekEnd);

    const { apollo, stripe } = externalFeesWeekly();

    const thisWeekBurn  = claudeThisWeek  + apollo + stripe;
    const priorWeekBurn = claudePriorWeek + apollo + stripe;
    const weekTrend     = priorWeekBurn > 0
      ? Math.round(((thisWeekBurn - priorWeekBurn) / priorWeekBurn) * 100)
      : null;

    return NextResponse.json({
      summary,
      dailyCosts,
      recentLogs,
      totalMTD,
      totalTokens,
      weeklyBurn: {
        thisWeek: {
          start: thisWeekStart.toISOString().split('T')[0],
          claude:  parseFloat(claudeThisWeek.toFixed(4)),
          apollo:  parseFloat(apollo.toFixed(4)),
          stripe:  parseFloat(stripe.toFixed(4)),
          total:   parseFloat(thisWeekBurn.toFixed(4)),
        },
        priorWeek: {
          start: priorWeekStart.toISOString().split('T')[0],
          claude:  parseFloat(claudePriorWeek.toFixed(4)),
          apollo:  parseFloat(apollo.toFixed(4)),
          stripe:  parseFloat(stripe.toFixed(4)),
          total:   parseFloat(priorWeekBurn.toFixed(4)),
        },
        trendPct: weekTrend,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
