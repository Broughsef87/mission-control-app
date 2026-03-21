import TeamRoster from '@/components/TeamRoster';
import AnimatedOffice from '@/components/AnimatedOffice';
import projects from '@/lib/projects.json';

const systemVitals = [
  { name: 'Agent Ops', status: 'Nominal', value: '99.8%' },
  { name: 'API Latency', status: 'Optimal', value: '72ms' },
  { name: 'Forge Revenue', status: 'Tracking', value: '$3,102' },
  { name: 'VectorDB', status: 'Healthy', value: '1.2M chunks' },
];

export default function Home() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
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
          <div className="h-2 w-2 rounded-full bg-brand-gold animate-pulse"></div>
          <span className="text-[10px] text-brand-ink font-bold uppercase tracking-widest">Systems Nominal</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Office & Projects */}
        <div className="lg:col-span-8 space-y-8">
          <section data-reveal="1" className="forge-panel !p-0 overflow-hidden relative group">
            <div className="absolute top-4 left-4 z-10">
              <h2 className="forge-heading text-lg">Agent HQ</h2>
              <p className="text-[10px] text-brand-medium-gray font-mono uppercase tracking-widest">Real-time Visualization</p>
            </div>
            <div className="aspect-video w-full bg-brand-ivory">
              <AnimatedOffice />
            </div>
          </section>

          <section data-reveal="2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="forge-heading text-2xl">Active Projects</h2>
              <button className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-ink transition-colors">
                View All Projects →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} className="forge-panel group cursor-pointer relative overflow-hidden !rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="forge-heading text-lg group-hover:text-brand-gold transition-colors">{project.name}</h3>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                        project.status === 'In Progress'
                          ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
                          : 'border-brand-warm-gray text-brand-medium-gray'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-brand-slate font-sans mb-6 line-clamp-2 italic">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-brand-warm-gray">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border border-brand-warm-gray bg-brand-ivory flex items-center justify-center text-[8px] font-bold text-brand-charcoal uppercase">
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-brand-medium-gray">UPDATED 2H AGO</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Roster & Vitals */}
        <div data-reveal="3" className="lg:col-span-4 space-y-8">
          <TeamRoster />

          <section className="forge-panel">
            <h2 className="forge-heading text-xl mb-6">System Vitals</h2>
            <div className="space-y-4">
              {systemVitals.map(vital => (
                <div key={vital.name} className="flex justify-between items-center group">
                  <div>
                    <div className="text-[10px] font-bold text-brand-slate uppercase tracking-widest group-hover:text-brand-ink transition-colors">{vital.name}</div>
                    <div className="text-xs font-mono text-brand-medium-gray">{vital.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-brand-ink font-mono">{vital.value}</div>
                    <div className="h-0.5 w-full bg-brand-warm-gray mt-1 overflow-hidden">
                      <div
                        className="h-full bg-brand-gold"
                        style={{ width: vital.value.includes('%') ? vital.value : '70%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="forge-button w-full mt-8">
              Open Full Diagnostics
            </button>
          </section>

          <section className="forge-panel border-dashed border-brand-warm-gray bg-brand-parchment">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-gold/10 border border-brand-gold/20 rounded-sm">
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
