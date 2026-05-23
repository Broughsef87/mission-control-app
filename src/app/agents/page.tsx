import { getAgentStatuses } from '@/lib/db';
import AnimatedOffice from '@/components/AnimatedOffice';
import AgentLogsSection from '@/components/AgentLogsSection';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const [statuses] = await Promise.all([
    getAgentStatuses().catch(() => []),
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

          <AgentLogsSection />
        </div>

        {/* Right: Agent Roster */}
        <div data-reveal="2" className="lg:col-span-4 space-y-6">
          {/* Active Agents */}
          <div className="forge-panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="forge-heading text-lg">Active Now</h2>
              <span className="text-[9px] font-mono text-ab-green animate-pulse uppercase tracking-widest font-bold">{active.length} Live</span>
            </div>
            <div className="space-y-3">
              {active.length === 0 ? (
                <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest text-center py-4">No agents active</p>
              ) : (active as any[]).map((agent: any) => (
                <div key={agent.id} className="forge-panel p-3 border-ab-green/30">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 bg-[#0F1520] border border-[#28CD41]/50 rounded-xl flex items-center justify-center text-xs font-bold text-[#28CD41] uppercase italic">
                        {agent.agent_name.substring(0, 2)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0A0D14] bg-[#28CD41]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-ink uppercase tracking-wider">{agent.agent_name}</div>
                      <div className="text-[9px] font-mono text-ab-green uppercase">{agent.task ?? agent.location}</div>
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
                <div key={agent.id} className="forge-panel flex items-center justify-between p-3 hover:border-brand-gold/40 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 bg-[#0F1520] border border-[#1A2130] rounded-xl flex items-center justify-center text-xs font-bold text-[#EAEAEA] uppercase italic group-hover:border-[#E8A320] transition-colors">
                        {agent.agent_name.substring(0, 2)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0A0D14] ${agent.status === 'Working' ? 'bg-[#28CD41]' : 'bg-[#1A2130]'}`} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-brand-ink uppercase tracking-wider">{agent.agent_name}</div>
                      <div className="text-[9px] font-mono text-brand-medium-gray uppercase">{agent.location ?? '—'}</div>
                    </div>
                  </div>
                  <div className={`text-[9px] font-bold uppercase italic ${agent.status === 'Working' ? 'text-ab-green' : 'text-brand-medium-gray'}`}>
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
