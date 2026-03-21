"use client";

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Props {
  onAdded: () => void;
}

const CATEGORIES = ['agency', 'app', 'community', 'other'];

export default function RevenueEntryForm({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: '',
    category: 'agency',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/revenue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to save');
      setSaving(false);
      return;
    }

    setForm({ date: new Date().toISOString().split('T')[0], amount: '', source: '', category: 'agency', notes: '' });
    setSaving(false);
    setOpen(false);
    onAdded();
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-5 py-2.5 rounded-lg tracking-widest transition-all italic"
        >
          <Plus className="w-3 h-3" /> Log Revenue
        </button>
      ) : (
        <div className="forge-panel animate-[reveal-up_0.3s_ease_forwards]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="forge-heading text-base">Log Revenue Entry</h3>
            <button onClick={() => setOpen(false)} className="text-brand-medium-gray hover:text-brand-ink">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => update('date', e.target.value)}
                  required
                  className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-[11px] font-mono text-brand-ink focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={e => update('amount', e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-[11px] font-mono text-brand-ink focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Source / Description</label>
              <input
                type="text"
                value={form.source}
                onChange={e => update('source', e.target.value)}
                required
                placeholder="Forge Agency - Client Name"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-[11px] font-mono text-brand-ink focus:outline-none focus:border-brand-gold uppercase"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-[11px] font-mono text-brand-ink focus:outline-none focus:border-brand-gold uppercase"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder="Additional context..."
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-[11px] font-mono text-brand-ink focus:outline-none focus:border-brand-gold"
              />
            </div>

            {error && <p className="text-[10px] text-red-500 font-mono uppercase">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="forge-button disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Revenue Entry'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
