"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, Plus, MessageSquare, List, CheckCircle2, MoreVertical, Layout, Kanban, X, Trash2 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  channel: string;
  status: string;
  priority: string;
  type: string;
  notes?: string;
  created_at: string;
}

const CHANNELS = [
  { name: 'YouTube',       icon: Youtube,       colorClass: 'text-red-500',    bg: 'bg-red-50' },
  { name: 'Forge OS Blog', icon: Layout,         colorClass: 'text-brand-gold', bg: 'bg-brand-gold/10' },
  { name: 'X/Twitter',     icon: MessageSquare,  colorClass: 'text-blue-500',   bg: 'bg-blue-50' },
  { name: 'Skool',         icon: List,           colorClass: 'text-green-600',  bg: 'bg-green-50' },
];

const COLUMNS = ['backlog', 'scripting', 'production', 'published'];
const COLUMN_LABELS: Record<string, string> = { backlog: 'Backlog', scripting: 'Scripting', production: 'Production', published: 'Published' };
const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'border-red-300 text-red-600 bg-red-50',
  High:     'border-brand-gold/40 text-brand-gold bg-brand-gold/5',
  Medium:   'border-blue-300 text-blue-600 bg-blue-50',
  Low:      'border-brand-warm-gray text-brand-medium-gray',
};

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', channel: 'YouTube', status: 'backlog', priority: 'Medium', type: 'Video', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await fetch('/api/content').then(r => r.json()).catch(() => []);
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ title: '', channel: 'YouTube', status: 'backlog', priority: 'Medium', type: 'Video', notes: '' });
    setSaving(false);
    load();
  }

  async function moveItem(id: string, status: string) {
    await fetch(`/api/content?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  async function deleteItem(id: string) {
    await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const byChannel = CHANNELS.map(ch => ({
    ...ch,
    count: items.filter(i => i.channel === ch.name).length,
  }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-3xl">Content <span className="text-brand-gold">Pipeline</span></h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Multimedia Production Hub // Forge OS Media
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-6 py-2 rounded-lg tracking-widest transition-all italic flex items-center gap-2"
        >
          <Plus className="w-3 h-3" /> New Item
        </button>
      </div>

      {/* New Item Form */}
      {showForm && (
        <div data-reveal="0" className="forge-panel !rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="forge-heading text-base">New Content Item</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-brand-medium-gray" /></button>
          </div>
          <form onSubmit={createItem} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                placeholder="Content title..."
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-gold uppercase tracking-tight" />
            </div>
            {[
              { label: 'Channel', field: 'channel', options: CHANNELS.map(c => c.name) },
              { label: 'Status', field: 'status', options: COLUMNS },
              { label: 'Priority', field: 'priority', options: ['Low', 'Medium', 'High', 'Critical'] },
              { label: 'Type', field: 'type', options: ['Video', 'Short', 'Article', 'Thread', 'Post'] },
            ].map(({ label, field, options }) => (
              <div key={field}>
                <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">{label}</label>
                <select value={(form as any)[field]} onChange={e => setForm(p => ({...p, [field]: e.target.value}))}
                  className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold">
                  {options.map(o => <option key={o} value={o}>{COLUMN_LABELS[o] ?? o}</option>)}
                </select>
              </div>
            ))}
            <div className="col-span-2">
              <button type="submit" disabled={saving} className="forge-button disabled:opacity-50">
                {saving ? 'Creating...' : 'Add to Pipeline'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Channel Hub */}
      <div data-reveal="1" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {byChannel.map((ch) => {
          const Icon = ch.icon;
          return (
            <div key={ch.name} className="bg-white border border-brand-warm-gray rounded-2xl p-4 hover:border-brand-gold/40 transition-all cursor-pointer group relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-12 h-12 text-brand-ink" />
              </div>
              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ch.bg}`}>
                    <Icon className={`w-3 h-3 ${ch.colorClass}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-slate">{ch.name}</span>
                </div>
                <div className="text-2xl font-black text-brand-ink mt-1">{ch.count}</div>
                <div className="text-[8px] font-mono text-brand-medium-gray uppercase">items</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div data-reveal="2" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
        {COLUMNS.map((col) => {
          const colItems = items.filter(i => i.status === col);
          return (
            <div key={col} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-slate">
                  {COLUMN_LABELS[col]} <span className="text-brand-gold ml-1">({colItems.length})</span>
                </h3>
                <MoreVertical className="w-3 h-3 text-brand-medium-gray" />
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="h-24 bg-brand-warm-gray rounded-xl animate-pulse" />
                ) : colItems.length === 0 ? (
                  <div className="h-20 border border-dashed border-brand-warm-gray rounded-xl flex items-center justify-center">
                    <span className="text-[9px] font-mono text-brand-medium-gray uppercase">Empty</span>
                  </div>
                ) : colItems.map((item) => (
                  <div key={item.id} className="bg-white border border-brand-warm-gray rounded-xl p-4 hover:border-brand-gold/50 transition-all cursor-move group relative" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full bg-brand-gold transition-all duration-300 rounded-l-xl" />
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 border rounded-full ${PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.Low}`}>
                        {item.priority}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => deleteItem(item.id)} className="text-brand-medium-gray hover:text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-[11px] font-black text-brand-ink group-hover:text-brand-gold transition-colors mb-3 leading-tight uppercase tracking-tight">{item.title}</h4>
                    <div className="flex justify-between items-center pt-2 border-t border-brand-warm-gray">
                      <span className="text-[9px] font-mono text-brand-slate uppercase">{item.channel}</span>
                      <span className="text-[8px] font-mono text-brand-medium-gray italic">{item.type}</span>
                    </div>
                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter(c => c !== col).map(c => (
                        <button key={c} onClick={() => moveItem(item.id, c)}
                          className="flex-1 text-[7px] font-mono text-brand-medium-gray hover:text-brand-gold border border-brand-warm-gray hover:border-brand-gold rounded px-1 py-0.5 transition-all uppercase truncate">
                          → {COLUMN_LABELS[c]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setShowForm(true); setForm(p => ({...p, status: col})); }}
                  className="w-full py-2.5 border border-dashed border-brand-warm-gray hover:border-brand-gold/50 rounded-xl text-brand-medium-gray hover:text-brand-gold transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
