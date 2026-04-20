"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Target, Plus, X, CheckCircle2, Clock, Pause, Trash2 } from 'lucide-react';

interface Company { id: string; name: string; color: string; }
interface Goal {
  id: string; title: string; description?: string; status: string;
  target_date?: string; company_id?: string;
  companies?: { name: string; color: string };
}

const STATUS_STYLES: Record<string, string> = {
  Active:   'text-brand-gold border-brand-gold/40 bg-brand-gold/5',
  Achieved: 'text-green-600 border-green-300 bg-green-50',
  Paused:   'text-brand-medium-gray border-brand-warm-gray',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Active:   <Clock className="w-3 h-3" />,
  Achieved: <CheckCircle2 className="w-3 h-3" />,
  Paused:   <Pause className="w-3 h-3" />,
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', company_id: '', target_date: '', status: 'Active' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [g, c] = await Promise.all([
      fetch('/api/goals').then(r => r.json()).catch(() => []),
      fetch('/api/companies').then(r => r.json()).catch(() => []),
    ]);
    setGoals(g ?? []);
    setCompanies(c ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, company_id: form.company_id || null }),
    });
    setShowForm(false);
    setForm({ title: '', description: '', company_id: '', target_date: '', status: 'Active' });
    setSaving(false);
    load();
  }

  async function toggleStatus(goal: Goal) {
    const next = goal.status === 'Active' ? 'Achieved' : goal.status === 'Achieved' ? 'Paused' : 'Active';
    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goal.id, status: next }),
    });
    load();
  }

  async function deleteGoal(id: string) {
    await fetch('/api/goals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const grouped = goals.reduce((acc, g) => {
    const key = g.companies?.name ?? 'Unassigned';
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {} as Record<string, Goal[]>);

  return (
    <div className="space-y-8 max-w-5xl">
      <header data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-4xl lg:text-5xl mb-2">
            Goals <span className="text-brand-gold">& Mission</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
            Company-Level Objectives — {goals.filter(g => g.status === 'Active').length} Active
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-5 py-2 rounded-lg tracking-widest transition-all italic flex items-center gap-2"
        >
          <Plus className="w-3 h-3" /> New Goal
        </button>
      </header>

      {showForm && (
        <div data-reveal="0" className="forge-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="forge-heading text-base flex items-center gap-2"><Target className="w-4 h-4 text-brand-gold" /> New Goal</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-brand-medium-gray" /></button>
          </div>
          <form onSubmit={createGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Goal *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                placeholder="e.g. Reach $10K MRR by Q3"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Company</label>
              <select value={form.company_id} onChange={e => setForm(p => ({...p, company_id: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold">
                <option value="">— Unassigned —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Target Date</label>
              <input type="date" value={form.target_date} onChange={e => setForm(p => ({...p, target_date: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-mono text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold resize-none" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="forge-button disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-brand-warm-gray rounded-2xl animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20">
          <Target className="w-8 h-8 text-brand-warm-gray mx-auto mb-3" />
          <p className="text-[11px] font-mono text-brand-medium-gray uppercase tracking-widest">No goals yet. Create your first goal above.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([company, companyGoals]) => (
          <div key={company} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono font-bold text-brand-medium-gray uppercase tracking-[0.25em]">{company}</span>
              <div className="flex-1 h-px bg-brand-warm-gray" />
            </div>
            {companyGoals.map(goal => (
              <div key={goal.id} className="forge-panel flex items-start gap-4 hover:border-brand-gold/40 transition-all group">
                <button
                  onClick={() => toggleStatus(goal)}
                  title="Click to cycle status"
                  className={`shrink-0 mt-0.5 flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-mono uppercase tracking-wide font-bold transition-all ${STATUS_STYLES[goal.status] ?? STATUS_STYLES.Active}`}
                >
                  {STATUS_ICONS[goal.status]}
                  {goal.status}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-brand-ink uppercase tracking-tight text-sm">{goal.title}</div>
                  {goal.description && <div className="text-[11px] text-brand-slate italic mt-1">{goal.description}</div>}
                </div>
                <div className="shrink-0 text-right space-y-1">
                  {goal.target_date && (
                    <div className="text-[9px] font-mono text-brand-medium-gray">{goal.target_date}</div>
                  )}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-brand-medium-gray hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
