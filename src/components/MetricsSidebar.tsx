'use client';

import { BarChart3, TrendingUp, Users, Target, Zap } from 'lucide-react';

export default function MetricsSidebar() {
  const metrics = [
    { label: 'System Efficiency', value: '94%', change: '+2.4%', icon: <Zap size={14} className="text-ab-gold" /> },
    { label: 'Active Agents', value: '6', change: 'Stable', icon: <Users size={14} className="text-ab-blue" /> },
    { label: 'Goal Progress', value: '68%', change: '+5.1%', icon: <Target size={14} className="text-ab-red" /> },
    { label: 'Network Latency', value: '24ms', change: '-2ms', icon: <TrendingUp size={14} className="text-ab-green" /> },
  ];

  return (
    <div className="forge-panel h-full">
      <h3 className="text-sm font-semibold text-ab-text uppercase tracking-wider flex items-center gap-2 mb-6">
        <BarChart3 size={16} className="text-ab-blue" />
        Key Metrics
      </h3>

      <div className="space-y-6">
        {metrics.map((m) => (
          <div key={m.label} className="group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ab-body flex items-center gap-2">
                {m.icon}
                {m.label}
              </span>
              <span className={`text-[10px] font-mono ${
                m.change.startsWith('+') ? 'text-ab-green' : 
                m.change.startsWith('-') ? 'text-ab-blue' : 'text-ab-muted'
              }`}>
                {m.change}
              </span>
            </div>
            <div className="text-xl font-bold text-ab-text font-mono tracking-tight">
              {m.value}
            </div>
            <div className="w-full bg-ab-surface-2 h-1 rounded-full mt-2 overflow-hidden">
               <div 
                 className="bg-ab-blue h-full transition-all duration-1000 group-hover:bg-ab-blue" 
                 style={{ width: m.value.includes('%') ? m.value : '75%' }}
               ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-ab-border">
        <h4 className="text-[10px] font-semibold text-ab-muted uppercase tracking-widest mb-4">Live Feed</h4>
        <div className="space-y-3">
          <div className="text-[11px] text-ab-body border-l-2 border-ab-blue/50 pl-2 py-1">
            <span className="text-ab-muted font-mono">18:45</span> PR #24 merged by Max
          </div>
          <div className="text-[11px] text-ab-body border-l-2 border-ab-green/50 pl-2 py-1">
            <span className="text-ab-muted font-mono">18:42</span> System check: 100% pass
          </div>
        </div>
      </div>
    </div>
  );
}

