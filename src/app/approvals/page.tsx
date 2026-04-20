"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Status = 'pending' | 'approved' | 'denied' | 'all';

interface Approval {
  id: string;
  agent_name: string;
  action_type: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  companies?: { name: string; color: string };
}

const STATUS_PILL: Record<string, string> = {
  pending:  'text-amber-700 bg-amber-50 border-amber-200',
  approved: 'text-green-700 bg-green-50 border-green-200',
  denied:   'text-red-600 bg-red-50 border-red-200',
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ agent_name: '', action_type: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch all approvals regardless of status — we filter client-side for now
    // The API returns only pending by default; fetch all statuses
    const data = await fetch('/api/approvals').then(r => r.json()).catch(() => []);
    setApprovals(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: string, status: 'approved' | 'denied') {
    await fetch('/api/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, resolved_by: 'andrew' }),
    });
    load();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ agent_name: '', action_type: '', title: '', description: '' });
    setShowCreate(false);
    setSaving(false);
    load();
  }

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter);
  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-4xl sm:text-5xl mb-1">
            Approvals <span className="text-brand-gold">Inbox</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.25em]">
            {pendingCount > 0
              ? `${pendingCount} waiting for your decision`
              : 'Nothing waiting — inbox clear'}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-2 bg-brand-charcoal text-white text-[10px] font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity self-start"
        >
          <Plus className="w-3 h-3" /> New Approval
        </button>
      </header>

      {/* Create Form */}
      {showCreate && (
        <div className="forge-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span className="forge-heading text-base">New Approval Request</span>
            </div>
            <button onClick={() => setShowCreate(false)}>
              <X className="w-4 h-4 text-brand-medium-gray hover:text-brand-ink transition-colors" />
            </button>
          </div>
          <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="forge-label block mb-1">Agent / Requestor</label>
              <input
                required
                value={form.agent_name}
                onChange={e => setForm(p => ({ ...p, agent_name: e.target.value }))}
                placeholder="e.g. archon, n8n"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="forge-label block mb-1">Type</label>
              <input
                required
                value={form.action_type}
                onChange={e => setForm(p => ({ ...p, action_type: e.target.value }))}
                placeholder="e.g. content, deploy, payment"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="forge-label block mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="What needs approval?"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-gold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="forge-label block mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Context, reason, or consequence of delay..."
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="forge-button disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'approved', 'denied', 'all'] as Status[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
              filter === s
                ? 'bg-brand-ink text-white border-brand-ink'
                : 'text-brand-medium-gray border-brand-warm-gray hover:border-brand-slate hover:text-brand-ink'
            }`}
          >
            {s}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-brand-gold text-white text-[8px] px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-brand-warm-gray rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck className="w-8 h-8 text-brand-warm-gray mx-auto mb-3" />
          <p className="text-[11px] font-mono text-brand-medium-gray uppercase tracking-widest">
            {filter === 'pending' ? 'No pending approvals — inbox clear' : `No ${filter} approvals`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="forge-panel">
              <div className="flex items-start gap-4">
                <Clock className="w-4 h-4 text-brand-medium-gray shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[9px] font-mono font-bold text-brand-gold uppercase">{a.agent_name}</span>
                    <span className="text-[8px] font-mono text-brand-medium-gray bg-brand-warm-gray px-1.5 py-0.5 rounded uppercase">
                      {a.action_type}
                    </span>
                    <span className={`text-[8px] font-mono font-bold border px-1.5 py-0.5 rounded uppercase ${STATUS_PILL[a.status] ?? ''}`}>
                      {a.status}
                    </span>
                    {a.companies && (
                      <span
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase"
                        style={{ backgroundColor: a.companies.color + '20', color: a.companies.color }}
                      >
                        {a.companies.name}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-brand-ink uppercase tracking-tight">{a.title}</div>
                  {a.description && (
                    <div className="text-[11px] text-brand-slate italic mt-1">{a.description}</div>
                  )}
                  <div className="text-[8px] font-mono text-brand-medium-gray mt-1.5">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    {a.resolved_at && ` · resolved by ${a.resolved_by}`}
                  </div>
                </div>
              </div>

              {a.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-brand-warm-gray">
                  <button
                    onClick={() => resolve(a.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => resolve(a.id, 'denied')}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-red-200 text-red-500 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-3 h-3" /> Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
