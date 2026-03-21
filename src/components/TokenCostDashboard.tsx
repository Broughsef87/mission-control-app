"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, Cpu, TrendingUp } from 'lucide-react';

interface CostSummary {
  summary: Record<string, { cost: number; tokens: number; actions: number }>;
  dailyCosts: Record<string, number>;
  recentLogs: Array<{
    id: string; agent_name: string; action: string;
    cost: number; tokens: number; model: string; created_at: string;
  }>;
  totalMTD: number;
  totalTokens: number;
}

export default function TokenCostDashboard() {
  const [data, setData] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent-costs')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="forge-panel space-y-3">
        <div className="h-4 w-40 bg-brand-warm-gray rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-brand-warm-gray rounded-xl animate-pulse" />)}
      </div>
    );
  }

  const agents = Object.entries(data?.summary ?? {}).sort((a, b) => b[1].cost - a[1].cost);
  const days = Object.entries(data?.dailyCosts ?? {}).slice(-7);
  const maxCost = Math.max(...days.map(([, v]) => v), 0.001);

  return (
    <div className="forge-panel space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-brand-gold" />
          <h2 className="forge-heading text-lg">AI Cost Tracker</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black font-mono text-brand-ink">${(data?.totalMTD ?? 0).toFixed(2)}</div>
          <div className="text-[9px] font-mono text-brand-medium-gray uppercase">MTD Spend</div>
        </div>
      </div>

      {/* Daily Cost Sparkline */}
      {days.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3 h-3 text-brand-medium-gray" />
            <span className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {days.map(([day, cost]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand-gold/20 rounded-sm hover:bg-brand-gold/40 transition-colors relative group"
                  style={{ height: `${Math.max(4, (cost / maxCost) * 56)}px` }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-brand-gold rounded-sm"
                    style={{ height: `${Math.max(2, (cost / maxCost) * 56)}px` }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[7px] font-mono text-brand-gold opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    ${cost.toFixed(3)}
                  </div>
                </div>
                <span className="text-[7px] font-mono text-brand-medium-gray">
                  {new Date(day).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-Agent Breakdown */}
      {agents.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3 h-3 text-brand-medium-gray" />
            <span className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest">By Agent (MTD)</span>
          </div>
          {agents.map(([agent, stats]) => {
            const maxAgentCost = Math.max(...agents.map(([, s]) => s.cost), 0.001);
            return (
              <div key={agent} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-brand-ink uppercase tracking-tight">{agent}</span>
                  <div className="flex items-center gap-3 text-[8px] font-mono text-brand-medium-gray">
                    <span>{stats.actions} actions</span>
                    <span className="text-brand-gold font-bold">${stats.cost.toFixed(4)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-brand-warm-gray rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gold rounded-full transition-all"
                    style={{ width: `${(stats.cost / maxAgentCost) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Cpu className="w-6 h-6 text-brand-warm-gray mx-auto mb-2" />
          <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
            No token data yet. Agent costs appear here automatically.
          </p>
        </div>
      )}

      {/* Total tokens */}
      {data && data.totalTokens > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-brand-warm-gray">
          <span className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest">Total Tokens MTD</span>
          <span className="text-[10px] font-mono font-bold text-brand-ink">
            {(data.totalTokens / 1000).toFixed(1)}K
          </span>
        </div>
      )}
    </div>
  );
}
