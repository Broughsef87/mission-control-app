"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Trash2, TrendingUp } from 'lucide-react';
import RevenueEntryForm from '@/components/RevenueEntryForm';

interface RevenueEntry {
  id: string;
  date: string;
  amount: number;
  source: string;
  category: string;
  notes?: string;
}

interface MTDSummary {
  total: number;
  byCategory: Record<string, number>;
}

const CATEGORY_COLORS: Record<string, string> = {
  agency: 'text-brand-gold border-brand-gold/40 bg-brand-gold/5',
  app: 'text-blue-600 border-blue-300 bg-blue-50',
  community: 'text-green-600 border-green-300 bg-green-50',
  other: 'text-brand-medium-gray border-brand-warm-gray',
};

const GOAL_ANNUAL = 1_000_000;
const GOAL_MONTHLY = GOAL_ANNUAL / 12;

export default function RevenuePage() {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [mtd, setMtd] = useState<MTDSummary>({ total: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [entriesRes, mtdRes] = await Promise.all([
      fetch('/api/revenue').then(r => r.json()).catch(() => []),
      fetch('/api/revenue?summary=true').then(r => r.json()).catch(() => ({ total: 0, byCategory: {} })),
    ]);
    setEntries(entriesRes ?? []);
    setMtd(mtdRes ?? { total: 0, byCategory: {} });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteEntry(id: string) {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/revenue?id=${id}`, { method: 'DELETE' });
    load();
  }

  const pctOfGoal = Math.min(100, (mtd.total / GOAL_MONTHLY) * 100);
  const annualPace = mtd.total * 12;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header data-reveal="0" className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-4xl lg:text-6xl mb-2">
            Revenue <span className="text-brand-gold">Tracker</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
            Financial Growth & Pipeline Tracking
          </p>
        </div>
        <RevenueEntryForm onAdded={load} />
      </header>

      {/* KPI Cards */}
      <div data-reveal="1" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="forge-panel !rounded-2xl bg-brand-charcoal border-brand-charcoal text-white">
          <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">MTD Revenue</div>
          <div className="text-3xl font-black font-mono italic">${mtd.total.toLocaleString()}</div>
        </div>
        <div className="forge-card rounded-2xl p-5">
          <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest mb-1">Annual Pace</div>
          <div className="text-2xl font-black font-mono text-brand-ink">${Math.round(annualPace).toLocaleString()}</div>
        </div>
        <div className="forge-card rounded-2xl p-5">
          <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest mb-1">Monthly Goal</div>
          <div className="text-2xl font-black font-mono text-brand-ink">${Math.round(GOAL_MONTHLY).toLocaleString()}</div>
        </div>
        <div className="forge-card rounded-2xl p-5">
          <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest mb-1">Entries</div>
          <div className="text-2xl font-black font-mono text-brand-ink">{entries.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Transaction History */}
        <div data-reveal="2" className="forge-panel md:col-span-2">
          <h2 className="forge-heading text-xl mb-6">Transaction History</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-brand-warm-gray rounded-xl animate-pulse" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-8 h-8 text-brand-warm-gray mx-auto mb-3" />
              <p className="text-[11px] font-mono text-brand-medium-gray uppercase tracking-widest">
                No entries yet. Log your first revenue above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-brand-parchment border border-brand-warm-gray rounded-xl group hover:border-brand-gold/40 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other}`}>
                      {item.category}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-brand-ink uppercase tracking-wider">{item.source}</div>
                      <div className="text-[9px] font-mono text-brand-medium-gray">{item.date}{item.notes ? ` — ${item.notes}` : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-brand-gold font-bold font-mono">+${Number(item.amount).toLocaleString()}</div>
                    <button
                      onClick={() => deleteEntry(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-brand-medium-gray hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Goals + Breakdown */}
        <div data-reveal="3" className="space-y-6">
          {/* Goal Progress */}
          <div className="forge-panel">
            <h3 className="forge-heading text-base mb-5">Monthly Goal Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-mono text-brand-slate mb-2">
                <span>${mtd.total.toLocaleString()} of ${Math.round(GOAL_MONTHLY).toLocaleString()}</span>
                <span className="text-brand-gold font-bold">{pctOfGoal.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full bg-brand-warm-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full transition-all duration-700"
                  style={{ width: `${pctOfGoal}%` }}
                />
              </div>
            </div>
            <div className="text-[9px] font-mono text-brand-medium-gray uppercase text-center">
              Annual Goal: $1,000,000
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(mtd.byCategory).length > 0 && (
            <div className="forge-panel">
              <h3 className="forge-heading text-base mb-4">By Category</h3>
              <div className="space-y-3">
                {Object.entries(mtd.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => {
                    const pct = mtd.total > 0 ? (amount / mtd.total) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-[10px] font-mono mb-1">
                          <span className="text-brand-slate uppercase">{cat}</span>
                          <span className="text-brand-ink font-bold">${amount.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-brand-warm-gray rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
