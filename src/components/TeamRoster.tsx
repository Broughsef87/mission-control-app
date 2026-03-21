import React from 'react';
import agentsData from '@/lib/agents.json';

const TeamRoster = () => {
  return (
    <section className="forge-panel">
      <div className="flex items-center justify-between mb-6">
        <h2 className="forge-heading text-xl">Team Roster</h2>
        <span className="text-[10px] font-mono text-brand-gold animate-pulse uppercase tracking-widest">Live</span>
      </div>

      <div className="space-y-4">
        {agentsData.map((agent: any) => (
          <div key={agent.id} className="flex items-center justify-between p-3 border border-brand-warm-gray bg-brand-parchment rounded-xl hover:border-brand-gold/40 transition-all group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-brand-ivory border border-brand-warm-gray rounded-xl flex items-center justify-center text-xs font-bold text-brand-charcoal uppercase italic group-hover:border-brand-gold transition-colors">
                  {agent.name.substring(0, 2)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  agent.status === 'Working' ? 'bg-green-500' : 'bg-brand-gold'
                }`}></div>
              </div>
              <div>
                <div className="text-xs font-bold text-brand-ink uppercase tracking-wider">{agent.name}</div>
                <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest">{agent.role}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-bold text-brand-medium-gray uppercase mb-1">Status</div>
              <div className={`text-[10px] font-bold uppercase italic ${
                agent.status === 'Working' ? 'text-green-600' : 'text-brand-gold'
              }`}>
                {agent.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-2 mt-6 border border-brand-warm-gray rounded-xl text-[10px] font-bold text-brand-medium-gray uppercase tracking-[0.2em] hover:text-brand-ink hover:bg-brand-parchment transition-all">
        Manage Deployment
      </button>
    </section>
  );
};

export default TeamRoster;
