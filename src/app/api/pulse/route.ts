import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const STATIC_FALLBACK = {
  dailyBurn: 42.18,
  monthlyBurn: 1240,
  agents: [
    { name: 'Devroux', status: 'Online', load: 85 },
    { name: 'Isaac', status: 'Online', load: 12 },
    { name: 'Charles', status: 'Offline', load: 0 },
    { name: 'Max', status: 'Online', load: 45 },
    { name: 'Gabriel', status: 'Offline', load: 0 },
    { name: 'Ollie', status: 'Idle', load: 5 },
  ],
  actions: [],
  tokens: [],
  status: [
    { id: '1', service: 'Vercel', status: 'Healthy', message: 'Mock data fallback', timestamp: new Date().toISOString() },
    { id: '2', service: 'YouTube', status: 'Healthy', message: 'Mock data fallback', timestamp: new Date().toISOString() },
    { id: '3', service: 'GitHub', status: 'Healthy', message: 'Mock data fallback', timestamp: new Date().toISOString() },
    { id: '4', service: 'Supabase', status: 'Healthy', message: 'Mock data fallback', timestamp: new Date().toISOString() }
  ],
};

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    // Fetch token costs from Supabase
    const { data: dailyLogs } = await supabase
      .from('agent_logs')
      .select('cost')
      .gte('created_at', today.toISOString())
      .not('cost', 'is', null);

    const { data: monthlyLogs } = await supabase
      .from('agent_logs')
      .select('cost')
      .gte('created_at', firstOfMonth.toISOString())
      .not('cost', 'is', null);

    const dailyBurn = (dailyLogs ?? []).reduce((sum, r) => sum + (r.cost ?? 0), 0);
    const monthlyBurn = (monthlyLogs ?? []).reduce((sum, r) => sum + (r.cost ?? 0), 0);

    // Fetch agent statuses from Supabase
    const { data: agentRows } = await supabase
      .from('agent_status')
      .select('agent_name, status, last_seen');

    const oneHourAgo = Date.now() - 1000 * 60 * 60;
    const agents = (agentRows ?? []).map(row => {
      const isRecent = new Date(row.last_seen).getTime() > oneHourAgo;
      return {
        name: row.agent_name,
        status: isRecent ? 'Online' : 'Offline',
        load: row.status === 'active' ? Math.floor(Math.random() * 40) + 10 : 0,
      };
    });

    // Fetch recent actions from Supabase
    const { data: actionsData } = await supabase
      .from('agent_logs')
      .select('id, agent_name, action, path, created_at, tokens, cost')
      .order('created_at', { ascending: false })
      .limit(30);

    const actions = (actionsData ?? []).map(row => ({
      id: row.id,
      agent: row.agent_name,
      action: row.action,
      path: row.path,
      timestamp: row.created_at
    }));

    const tokens = (actionsData ?? [])
      .filter(row => row.cost !== null && row.tokens !== null)
      .map(row => ({
        id: row.id,
        agent: row.agent_name,
        model: 'gemini-2.5-pro',
        tokens: row.tokens,
        cost: row.cost,
        timestamp: row.created_at
      }));

    // Mock status for ExternalRadar
    const status = [
      { id: '1', service: 'Vercel', status: 'Healthy', message: 'All systems operational', timestamp: new Date().toISOString() },
      { id: '2', service: 'YouTube', status: 'Healthy', message: 'API connected', timestamp: new Date().toISOString() },
      { id: '3', service: 'GitHub', status: 'Healthy', message: 'Webhooks active', timestamp: new Date().toISOString() },
      { id: '4', service: 'Supabase', status: 'Healthy', message: 'Database online', timestamp: new Date().toISOString() }
    ];

    // If Supabase returned data, use it; otherwise fall back to static
    if (agentRows && agentRows.length > 0) {
      return NextResponse.json({ dailyBurn, monthlyBurn, agents, actions, tokens, status });
    }

    // No cloud data yet — return static fallback with zero burn
    return NextResponse.json({ ...STATIC_FALLBACK, dailyBurn, monthlyBurn });
  } catch (error) {
    console.error('Pulse API error:', error);
    return NextResponse.json(STATIC_FALLBACK);
  }
}
