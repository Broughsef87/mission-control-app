'use client';

import { BarChart3, TrendingUp, Users, Target, Zap } from 'lucide-react';

export default function MetricsSidebar() {
  const metrics = [
    { label: 'System Efficiency', value: '94%', change: '+2.4%', icon: <Zap size={14} className="text-yellow-400" /> },
    { label: 'Active Agents', value: '6', change: 'Stable', icon: <Users size={14} className="text-blue-400" /> },
    { label: 'Goal Progress', value: '68%', change: '+5.1%', icon: <Target size={14} className="text-red-400" /> },
    { label: 'Network Latency', value: '24ms', change: '-2ms', icon: <TrendingUp size={14} className="text-green-400" /> },
  ];

  return (
    <div className="bg-[#1a1d24] border border-[#2f333e] rounded-xl p-5 shadow-sm h-full">
      <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2 mb-6">
        <BarChart3 size={16} className="text-indigo-400" />
        Key Metrics
      </h3>

      <div className="space-y-6">
        {metrics.map((m) => (
          <div key={m.label} className="group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 flex items-center gap-2">
                {m.icon}
                {m.label}
              </span>
              <span className={`text-[10px] font-mono ${
                m.change.startsWith('+') ? 'text-green-400' : 
                m.change.startsWith('-') ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {m.change}
              </span>
            </div>
            <div className="text-xl font-bold text-white font-mono tracking-tight">
              {m.value}
            </div>
            <div className="w-full bg-[#23262f] h-1 rounded-full mt-2 overflow-hidden">
               <div 
                 className="bg-indigo-500 h-full transition-all duration-1000 group-hover:bg-indigo-400" 
                 style={{ width: m.value.includes('%') ? m.value : '75%' }}
               ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-[#2f333e]">
        <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Live Feed</h4>
        <div className="space-y-3">
          <div className="text-[11px] text-gray-400 border-l-2 border-indigo-500/50 pl-2 py-1">
            <span className="text-gray-500 font-mono">18:45</span> PR #24 merged by Max
          </div>
          <div className="text-[11px] text-gray-400 border-l-2 border-green-500/50 pl-2 py-1">
            <span className="text-gray-500 font-mono">18:42</span> System check: 100% pass
          </div>
        </div>
      </div>
    </div>
  );
}
