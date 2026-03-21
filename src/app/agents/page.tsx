import { getAgentStatuses, getAgentLogs } from '@/lib/db';
import AnimatedOffice from '@/components/AnimatedOffice';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const [statuses, logs] = await Promise.all([
    getAgentStatuses().catch(() => []),
    getAgentLogs(30).catch(() => []),
  ]);

  const active = statuses.filter((a: any) => a.status === 'Working');
  const idle   = statuses.filter((a: any) => a.status === 'Idle');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header data-reveal="0" className="border-b border-brand-warm-gray pb-8">
        <h1 className="forge-heading text-4xl lg:text-6xl mb-2">
          Agents <span className="text-brand-gold">Station</span>
        </h1>
        <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
          Deployment Status & Active Personnel — {active.length}/{statuses.length} Active
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Office Visualization */}
        <div data-reveal="1" className="lg:col-span-8 space-y-6">
          <section className="forge-panel !p-0 overflow-hidden relative min-h-[400px]">
            <AnimatedOffice />
          </section>

          {/* Recent Agent Activity */}
          <div className="forge-panel">
            <h2 className="forge-heading text-lg mb-4">Recent Activity</h2>
            {logs.length === 0 ? (
              <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest text-center py-8">
                No agent activity logged yet. Agents write here automatically via OpenClaw.
              </p>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {(logs as any[]).map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-brand-warm-gray/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-mono font-bold text-brand-gold uppercase mr-2">{log.agent_name}</span>
                      <span className="text-[10px] text-brand-slate">{log.action}</span>
                      {log.path && <span className="text-[8px] font-mono text-brand-medium-gray ml-2 truncate">{log.path}</span>}
                    </div>
                    <div className="text-right shrink-0">
                      {log.cost > 0 && <div className="text-[8px] font-mono text-brand-medium-gray">${Number(log.cost).toFixed(4)}</div>}
                      <div className="text-[8px] font-mono text-brand-medium-gray opacity-60">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Agent Roster */}
        <div data-reveal="2" className="lg:col-span-4 space-y-6">
          {/* Active Agents */}
          <div className="forge-panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="forge-heading text-lg">Active Now</h2>
              <span className="text-[9px] font-mono text-green-600 animate-pulse uppercase tracking-widest font-bold">{active.length} Live</span>
            </div>
            <div className="space-y-3">
              {active.length === 0 ? (
                <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest text-center py-4">No agents active</p>
              ) : (active as any[]).map((agent: any) => (
                <div key={agent.id} className="p-3 border border-green-200 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 bg-green-100 border border-green-200 rounded-xl flex items-center justify-center text-xs font-bold text-green-700 uppercase italic">
                        {agent.agent_name.substring(0, 2)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-ink uppercase tracking-wider">{agent.agent_name}</div>
                      <div className="text-[9px] font-mono text-green-600 uppercase">{agent.task ?? agent.location}</div>
                    </div>
                    <div className="ml-auto text-[8px] font-mono text-brand-medium-gray">
                      {agent.last_seen ? formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Roster */}
          <div className="forge-panel">
            <h2 className="forge-heading text-lg mb-4">Full Roster</h2>
            <div className="space-y-3">
              {(statuses as any[]).map((agent: any) => (
                <div key={agent.id} className="flex items-center justify-between p-3 border border-brand-warm-gray bg-brand-parchment rounded-xl hover:border-brand-gold/40 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 bg-brand-ivory border border-brand-warm-gray rounded-xl flex items-center justify-center text-xs font-bold text-brand-charcoal uppercase italic group-hover:border-brand-gold transition-colors">
                        {agent.agent_name.substring(0, 2)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${agent.status === 'Working' ? 'bg-green-500' : 'bg-brand-warm-gray'}`} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-brand-ink uppercase tracking-wider">{agent.agent_name}</div>
                      <div className="text-[9px] font-mono text-brand-medium-gray uppercase">{agent.location ?? '—'}</div>
                    </div>
                  </div>
                  <div className={`text-[9px] font-bold uppercase italic ${agent.status === 'Working' ? 'text-green-600' : 'text-brand-medium-gray'}`}>
                    {agent.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
