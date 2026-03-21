import TeamRoster from '@/components/TeamRoster';
import AnimatedOffice from '@/components/AnimatedOffice';

export default function AgentsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="border-b border-brand-warm-gray pb-8">
        <h1 className="forge-heading text-4xl lg:text-6xl mb-2">
          Agents <span className="text-brand-gold">Station</span>
        </h1>
        <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
          Deployment Status & Active Personnel
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="forge-panel !p-0 overflow-hidden relative min-h-[500px]">
            <AnimatedOffice />
          </section>
        </div>
        <div className="lg:col-span-4">
          <TeamRoster />
        </div>
      </div>
    </div>
  );
}
