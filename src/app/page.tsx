import { getProjects, getAgentStatuses, getRevenueMTD } from '@/lib/db';
import MorningBriefing from '@/components/MorningBriefing';
import PlatformMetrics from '@/components/PlatformMetrics';
import LiveAgentFeed from '@/components/LiveAgentFeed';
import AnimatedOffice from '@/components/AnimatedOffice';
import Link from 'next/link';

const systemVitals = [
  { name: 'API Latency', status: 'Optimal', value: '72ms', pct: '90%' },
  { name: 'VectorDB', status: 'Healthy', value: '1.2M chunks', pct: '80%' },
];

export default async function Home() {
  const [projects, agentStatuses, revenueMTD] = await Promise.all([
    getProjects().catch(() => []),
    getAgentStatuses().catch(() => []),
    getRevenueMTD().catch(() => ({ total: 0, byCategory: {} })),
  ]);

  const activeAgents = agentStatuses.filter((a: any) => a.status === 'Working').length;
  const inProgressProjects = projects.filter((p: any) => p.status === 'In Progress').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header data-reveal="0" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-4xl sm:text-5xl lg:text-6xl mb-2">
            Mission <span className="text-brand-gold">Control</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
            Forge OS Command & Control Center // v2.4.0
          </p>
        </div>
        <div className="flex items-center gap-3 bg-brand-parchment border border-brand-warm-gray px-4 py-2 rounded-xl self-start">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-brand-ink font-bold uppercase tracking-widest">
            {activeAgents} Agents Active
          </span>
        </div>
      </header>

      {/* Morning Briefing */}
      <div data-reveal="1">
        <MorningBriefing />
      </div>

      {/* KPI Strip */}
      <div data-reveal="2" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue MTD', value: `$${revenueMTD.total.toLocaleString()}`, sub: 'Goal: $1M/yr', color: 'text-brand-gold' },
          { label: 'Active Agents', value: `${activeAgents}/${agentStatuses.length}`, sub: 'Deployed', color: 'text-green-600' },
          { label: 'Live Projects', value: String(inProgressProjects), sub: 'In progress', color: 'text-brand-ink' },
          { label: 'API Latency', value: '72ms', sub: 'Nominal', color: 'text-brand-ink' },
        ].map((kpi) => (
          <div key={kpi.label} className="forge-card rounded-2xl p-4">
            <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest mb-1">{kpi.label}</div>
            <div className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[9px] font-mono text-brand-medium-gray uppercase mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Agent HQ Visualization */}
          <section data-reveal="3" className="forge-panel !p-0 overflow-hidden relative group">
            <div className="absolute top-4 left-4 z-10">
              <h2 className="forge-heading text-lg">Agent HQ</h2>
              <p className="text-[10px] text-brand-medium-gray font-mono uppercase tracking-widest">Real-time Visualization</p>
            </div>
            <div className="aspect-video w-full bg-brand-ivory">
              <AnimatedOffice />
            </div>
          </section>

          {/* Platform Metrics */}
          <section data-reveal="4">
            <PlatformMetrics />
          </section>

          {/* Active Projects */}
          <section data-reveal="5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="forge-heading text-2xl">Active Projects</h2>
              <Link href="/projects" className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-ink transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(projects as any[]).filter(p => p.status === 'In Progress').slice(0, 4).map((project: any) => (
                <div key={project.id} className="forge-panel group cursor-pointer relative overflow-hidden !rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="forge-heading text-base group-hover:text-brand-gold transition-colors">{project.name}</h3>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-brand-gold text-brand-gold bg-brand-gold/5">
                        {project.status}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-brand-slate font-sans mb-4 line-clamp-2 italic">{project.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-brand-warm-gray">
                      <span className="text-[9px] font-mono text-brand-medium-gray uppercase">{project.client ?? 'Internal'}</span>
                      {project.deadline && (
                        <span className="text-[9px] font-mono text-brand-medium-gray">Due {project.deadline}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div data-reveal="4" className="lg:col-span-4 space-y-8">
          {/* Live Agent Feed */}
          <LiveAgentFeed />

          {/* System Vitals */}
          <section className="forge-panel">
            <h2 className="forge-heading text-lg mb-6">System Vitals</h2>
            <div className="space-y-4">
              {/* Revenue progress */}
              <div className="flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">Forge Revenue</div>
                  <div className="text-xs font-mono text-brand-medium-gray">Tracking</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-ink font-mono">${revenueMTD.total.toLocaleString()}</div>
                  <div className="h-0.5 w-24 bg-brand-warm-gray mt-1 overflow-hidden">
                    <div className="h-full bg-brand-gold" style={{ width: `${Math.min(100, (revenueMTD.total / 83333) * 100)}%` }} />
                  </div>
                </div>
              </div>
              {systemVitals.map(vital => (
                <div key={vital.name} className="flex justify-between items-center group">
                  <div>
                    <div className="text-[10px] font-bold text-brand-slate uppercase tracking-widest group-hover:text-brand-ink transition-colors">{vital.name}</div>
                    <div className="text-xs font-mono text-brand-medium-gray">{vital.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-ink font-mono">{vital.value}</div>
                    <div className="h-0.5 w-full bg-brand-warm-gray mt-1 overflow-hidden">
                      <div className="h-full bg-brand-gold" style={{ width: vital.pct }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/tools" className="forge-button mt-8 block text-center">
              Open Full Diagnostics
            </Link>
          </section>

          {/* Active Sprint Badge */}
          <section className="forge-panel border-dashed border-brand-warm-gray bg-brand-parchment">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-xl">
                <svg className="w-5 h-5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-brand-ink uppercase italic">Active Sprint</div>
                <div className="text-[10px] text-brand-medium-gray font-mono">24H AUTONOMOUS MODE</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
