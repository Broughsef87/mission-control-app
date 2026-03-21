export default function RevenuePage() {
  const revenueData = [
    { date: '2026-03-10', amount: 450.00, source: 'Forge Agency - Client A' },
    { date: '2026-03-12', amount: 1200.00, source: 'Forge Agency - Automation Build' },
    { date: '2026-03-14', amount: 350.00, source: 'Dad Strength App - Subscriptions' },
    { date: '2026-03-15', amount: 1102.00, source: 'Forge Agency - Audit' },
  ];

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header data-reveal="0" className="border-b border-brand-warm-gray pb-8">
        <h1 className="forge-heading text-4xl lg:text-6xl mb-2">
          Revenue <span className="text-brand-gold">Tracker</span>
        </h1>
        <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
          Financial Growth & Pipeline Tracking
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div data-reveal="1" className="forge-panel md:col-span-2">
          <h2 className="forge-heading text-xl mb-6">Transaction History</h2>
          <div className="space-y-4">
            {revenueData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-brand-parchment border border-brand-warm-gray rounded-xl">
                <div>
                  <div className="text-xs font-bold text-brand-ink uppercase tracking-wider">{item.source}</div>
                  <div className="text-[10px] font-mono text-brand-medium-gray uppercase">{item.date}</div>
                </div>
                <div className="text-brand-gold font-bold font-mono">+${item.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div data-reveal="2" className="space-y-8">
          <div className="forge-panel !rounded-2xl bg-brand-charcoal border-brand-charcoal text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Total Revenue (MTD)</h3>
            <div className="text-4xl font-bold font-mono italic text-white">${totalRevenue.toLocaleString()}</div>
          </div>

          <div className="forge-panel">
            <h3 className="forge-heading text-lg mb-4">Pipeline Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-brand-slate">
                  <span>Goal: $1M/Year</span>
                  <span>0.3%</span>
                </div>
                <div className="h-2 w-full bg-brand-warm-gray rounded-full overflow-hidden">
                  <div className="h-full bg-brand-gold w-[0.3%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
