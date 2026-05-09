import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getSupabaseAdmin();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: logs, error } = await db
      .from('agent_logs')
      .select('agent_name, action, path, model, tokens, cost, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const rows = logs ?? [];

    // Aggregate by agent
    const byAgent: Record<string, { actions: number; cost: number; tokens: number; last_action: string; last_at: string }> = {};
    for (const log of rows) {
      if (!byAgent[log.agent_name]) {
        byAgent[log.agent_name] = { actions: 0, cost: 0, tokens: 0, last_action: '', last_at: '' };
      }
      byAgent[log.agent_name].actions += 1;
      byAgent[log.agent_name].cost += Number(log.cost ?? 0);
      byAgent[log.agent_name].tokens += Number(log.tokens ?? 0);
      if (!byAgent[log.agent_name].last_action) {
        byAgent[log.agent_name].last_action = log.action ?? '';
        byAgent[log.agent_name].last_at = log.created_at;
      }
    }

    // Generate summary bullets (5 max)
    const bullets: string[] = [];
    const agents = Object.entries(byAgent).sort((a, b) => b[1].actions - a[1].actions);

    for (const [name, stats] of agents.slice(0, 5)) {
      const cost = stats.cost > 0 ? ` ($${stats.cost.toFixed(2)})` : '';
      const lastAction = stats.last_action
        ? ` — last: ${stats.last_action.slice(0, 60)}${stats.last_action.length > 60 ? '…' : ''}`
        : '';
      bullets.push(`${name}: ${stats.actions} actions${cost}${lastAction}`);
    }

    if (bullets.length === 0) {
      bullets.push('No agent activity in the last 24 hours.');
    }

    const totalCost = rows.reduce((sum, l) => sum + Number(l.cost ?? 0), 0);
    const totalTokens = rows.reduce((sum, l) => sum + Number(l.tokens ?? 0), 0);

    return NextResponse.json({
      bullets,
      total_actions: rows.length,
      total_cost: totalCost,
      total_cost_formatted: `$${totalCost.toFixed(2)}`,
      total_tokens: totalTokens,
      agents: agents.map(([name, s]) => ({ name, ...s })),
      since,
      as_of: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
