"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Plus, X, DollarSign, ArrowRight, Trash2, Edit3 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  pipeline_stage: string;
  contract_value?: number;
  contact_name?: string;
  contact_email?: string;
  renewal_date?: string;
  notes?: string;
  updated_at: string;
}

const STAGES = ['lead', 'proposal', 'active', 'invoiced', 'completed'];
const STAGE_LABELS: Record<string, string> = {
  lead:      'Lead',
  proposal:  'Proposal Sent',
  active:    'Active',
  invoiced:  'Invoiced',
  completed: 'Completed',
};
const STAGE_STYLES: Record<string, { card: string; badge: string }> = {
  lead:      { card: 'border-brand-warm-gray',  badge: 'bg-brand-parchment text-brand-medium-gray border-brand-warm-gray' },
  proposal:  { card: 'border-blue-200',          badge: 'bg-blue-50 text-blue-600 border-blue-200' },
  active:    { card: 'border-brand-gold/40',     badge: 'bg-brand-gold/10 text-brand-gold border-brand-gold/40' },
  invoiced:  { card: 'border-amber-300',         badge: 'bg-amber-50 text-amber-600 border-amber-300' },
  completed: { card: 'border-green-300',         badge: 'bg-green-50 text-green-600 border-green-300' },
};

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', pipeline_stage: 'lead', contract_value: '',
    contact_name: '', contact_email: '', renewal_date: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [stageFilter, setStageFilter] = useState('all');

  const load = useCallback(async () => {
    const data = await fetch('/api/clients').then(r => r.json()).catch(() => []);
    setClients(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      pipeline_stage: client.pipeline_stage,
      contract_value: client.contract_value?.toString() ?? '',
      contact_name: client.contact_name ?? '',
      contact_email: client.contact_email ?? '',
      renewal_date: client.renewal_date ?? '',
      notes: client.notes ?? '',
    });
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: '', pipeline_stage: 'lead', contract_value: '', contact_name: '', contact_email: '', renewal_date: '', notes: '' });
    setShowForm(false);
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      contract_value: form.contract_value ? Number(form.contract_value) : undefined,
    };

    if (editingId) {
      await fetch(`/api/clients?id=${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    resetForm();
    load();
  }

  async function moveStage(id: string, stage: string) {
    await fetch(`/api/clients?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline_stage: stage }),
    });
    setClients(prev => prev.map(c => c.id === id ? { ...c, pipeline_stage: stage } : c));
  }

  async function deleteClient(id: string) {
    if (!confirm('Delete this client?')) return;
    await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
    setClients(prev => prev.filter(c => c.id !== id));
  }

  const filtered = stageFilter === 'all' ? clients : clients.filter(c => c.pipeline_stage === stageFilter);
  const totalPipelineValue = clients.reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0);
  const activeValue = clients.filter(c => c.pipeline_stage === 'active').reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">Agency <span className="text-brand-gold">CRM</span></h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Client Pipeline & Relationship Management // Forge Agency
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-6 py-2 rounded-lg tracking-widest transition-all italic flex items-center gap-2"
        >
          <Plus className="w-3 h-3" /> Add Client
        </button>
      </div>

      {/* KPI Strip */}
      <div data-reveal="1" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, color: 'text-brand-ink' },
          { label: 'Active Contracts', value: clients.filter(c => c.pipeline_stage === 'active').length, color: 'text-brand-gold' },
          { label: 'Active Value', value: `$${activeValue.toLocaleString()}`, color: 'text-brand-gold' },
          { label: 'Pipeline Value', value: `$${totalPipelineValue.toLocaleString()}`, color: 'text-brand-ink' },
        ].map(kpi => (
          <div key={kpi.label} className="forge-card rounded-2xl p-4">
            <div className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest mb-1">{kpi.label}</div>
            <div className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div data-reveal="0" className="forge-panel !rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="forge-heading text-base">{editingId ? 'Edit Client' : 'New Client'}</h3>
            <button onClick={resetForm}><X className="w-4 h-4 text-brand-medium-gray" /></button>
          </div>
          <form onSubmit={saveClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Client / Company Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                placeholder="Client Name"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-gold uppercase" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Pipeline Stage</label>
              <select value={form.pipeline_stage} onChange={e => setForm(p => ({...p, pipeline_stage: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold">
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Contract Value ($)</label>
              <input type="number" value={form.contract_value} onChange={e => setForm(p => ({...p, contract_value: e.target.value}))}
                placeholder="4500"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-mono text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Contact Name</label>
              <input value={form.contact_name} onChange={e => setForm(p => ({...p, contact_name: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Contact Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm(p => ({...p, contact_email: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Renewal Date</label>
              <input type="date" value={form.renewal_date} onChange={e => setForm(p => ({...p, renewal_date: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-mono text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                placeholder="Deal context, next steps, requirements..."
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold resize-none" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="forge-button disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pipeline Filter Tabs */}
      <div data-reveal="2" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-medium-gray border-b border-brand-warm-gray pb-4">
        {['all', ...STAGES].map(s => (
          <button key={s} onClick={() => setStageFilter(s)}
            className={`transition-colors ${stageFilter === s ? 'text-brand-gold border-b-2 border-brand-gold pb-4 -mb-[17px]' : 'hover:text-brand-ink'}`}>
            {s === 'all' ? 'All' : STAGE_LABELS[s]}
            <span className="ml-1 opacity-60">({s === 'all' ? clients.length : clients.filter(c => c.pipeline_stage === s).length})</span>
          </button>
        ))}
      </div>

      {/* Client Cards */}
      <div data-reveal="3" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-brand-warm-gray rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="md:col-span-3 text-center py-16">
            <Users className="w-8 h-8 text-brand-warm-gray mx-auto mb-3" />
            <p className="text-[11px] font-mono text-brand-medium-gray uppercase tracking-widest">No clients found. Add your first client above.</p>
          </div>
        ) : filtered.map(client => {
          const styles = STAGE_STYLES[client.pipeline_stage] ?? STAGE_STYLES.lead;
          const stageIdx = STAGES.indexOf(client.pipeline_stage);
          const nextStage = STAGES[stageIdx + 1];
          return (
            <div key={client.id} className={`bg-white border ${styles.card} rounded-2xl p-5 group hover:shadow-md transition-all relative overflow-hidden`}>
              {/* Progress dots */}
              <div className="flex gap-1 mb-4">
                {STAGES.map((s, i) => (
                  <div key={s} className={`flex-1 h-0.5 rounded-full ${i <= stageIdx ? 'bg-brand-gold' : 'bg-brand-warm-gray'}`} />
                ))}
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-black text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors">
                    {client.name}
                  </h3>
                  {client.contact_name && (
                    <div className="text-[9px] font-mono text-brand-medium-gray">{client.contact_name}</div>
                  )}
                </div>
                <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full ${styles.badge}`}>
                  {STAGE_LABELS[client.pipeline_stage]}
                </span>
              </div>

              {client.contract_value && (
                <div className="flex items-center gap-1.5 mb-3">
                  <DollarSign className="w-3 h-3 text-brand-gold" />
                  <span className="text-lg font-black font-mono text-brand-ink">${Number(client.contract_value).toLocaleString()}</span>
                </div>
              )}

              {client.notes && (
                <p className="text-[10px] text-brand-slate italic mb-4 line-clamp-2">{client.notes}</p>
              )}

              {client.renewal_date && (
                <div className="text-[9px] font-mono text-brand-medium-gray uppercase mb-3">
                  Renewal: {client.renewal_date}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-brand-warm-gray">
                {nextStage && (
                  <button onClick={() => moveStage(client.id, nextStage)}
                    className="flex items-center gap-1.5 flex-1 justify-center py-1.5 bg-brand-parchment border border-brand-warm-gray rounded-lg hover:border-brand-gold hover:text-brand-gold text-brand-medium-gray text-[9px] font-black uppercase tracking-wide transition-all">
                    <ArrowRight className="w-3 h-3" />
                    {STAGE_LABELS[nextStage]}
                  </button>
                )}
                <button onClick={() => openEdit(client)}
                  className="p-2 border border-brand-warm-gray rounded-lg hover:border-brand-gold text-brand-medium-gray hover:text-brand-gold transition-all">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteClient(client.id)}
                  className="p-2 border border-brand-warm-gray rounded-lg hover:border-red-300 text-brand-medium-gray hover:text-red-500 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
