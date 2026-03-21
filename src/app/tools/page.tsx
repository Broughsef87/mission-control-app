"use client";

import React from 'react';
import { Cpu, Zap, Activity, Shield, GitBranch } from 'lucide-react';

const ToolsPage = () => {
  const tools = [
    { name: 'Forge Engine', desc: 'Core agentic orchestration framework', icon: Cpu, status: 'Active', load: '12%' },
    { name: 'Neural Link', desc: 'Cross-platform communication bridge', icon: Zap, status: 'Active', load: '4%' },
    { name: 'Task Auditor', desc: 'Automated quality assurance & logging', icon: Activity, status: 'Standby', load: '0%' },
    { name: 'Security Vault', desc: 'Encrypted credential & key management', icon: Shield, status: 'Active', load: '1%' },
  ];

  const repos = [
    { name: 'forge-os-kernel', branch: 'main', status: 'Healthy', commits: '142' },
    { name: 'dad-strength-app', branch: 'dev', status: 'Syncing', commits: '89' },
    { name: 'mission-control', branch: 'main', status: 'Healthy', commits: '45' },
    { name: 'autonomous-content', branch: 'research', status: 'Active', commits: '12' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">
            Agent <span className="text-brand-gold">Tools</span>
          </h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Infrastructure & System Utilities // Forge OS Internal
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border border-brand-warm-gray hover:border-brand-gold text-brand-ink font-black uppercase text-[10px] px-6 py-2 tracking-widest transition-all italic">
            System Scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Tooling */}
        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray mb-2">Core Services</h2>
          <div className="grid grid-cols-1 gap-4">
            {tools.map((tool) => (
              <div key={tool.name} className="bg-white border border-brand-warm-gray p-5 hover:border-brand-gold/40 transition-all group">
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-brand-parchment border border-brand-warm-gray text-brand-gold group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-brand-ink uppercase tracking-tight">{tool.name}</h3>
                      <span className="text-[8px] font-mono text-brand-gold uppercase font-bold tracking-widest">{tool.status}</span>
                    </div>
                    <p className="text-xs text-brand-medium-gray mb-4">{tool.desc}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-[2px] bg-brand-warm-gray overflow-hidden">
                        <div className="h-full bg-brand-gold" style={{ width: tool.load }} />
                      </div>
                      <span className="text-[9px] font-mono text-brand-medium-gray">CPU: {tool.load}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Git & Infrastructure */}
        <div className="space-y-8">
          <div className="bg-white border border-brand-warm-gray p-6 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray">Repository Health</h2>
            <div className="space-y-4">
              {repos.map((repo) => (
                <div key={repo.name} className="flex items-center justify-between p-3 border border-brand-warm-gray hover:bg-brand-parchment transition-colors group">
                  <div className="flex items-center gap-4">
                    <GitBranch className="w-4 h-4 text-brand-medium-gray group-hover:text-brand-gold" />
                    <div>
                      <div className="text-[11px] font-bold text-brand-ink uppercase tracking-tight">{repo.name}</div>
                      <div className="text-[8px] font-mono text-brand-medium-gray uppercase">branch: {repo.branch}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[9px] font-mono font-bold uppercase ${repo.status === 'Healthy' ? 'text-green-600' : 'text-brand-gold'}`}>
                      {repo.status}
                    </div>
                    <div className="text-[8px] font-mono text-brand-medium-gray uppercase">{repo.commits} commits</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-brand-warm-gray p-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-medium-gray mb-6 italic">// Dev Console</h2>
            <div className="bg-brand-charcoal p-4 border border-brand-warm-gray font-mono text-[10px] space-y-2 h-[150px] overflow-auto text-brand-medium-gray">
              <div className="text-brand-gold">forge-os@andrew-pc:~$ status check</div>
              <div className="text-brand-ivory">Analyzing infrastructure... OK</div>
              <div className="text-brand-ivory">Checking neural bridges... OK</div>
              <div className="text-brand-ivory">Database connection... STABLE</div>
              <div className="text-brand-medium-gray animate-pulse">_</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
