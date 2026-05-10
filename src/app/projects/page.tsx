"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { LayoutGrid, List, Search, ExternalLink, CheckCircle2, Clock, Plus, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  description?: string;
  client?: string;
  budget?: string;
  deadline?: string;
  priority: number;
}

const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'text-ab-gold border-ab-gold/40 bg-ab-gold/5',
  'Completed':   'text-ab-green border-ab-green/25 bg-[rgba(40,205,65,0.08)]',
  'In Review':   'text-ab-blue border-ab-blue/25 bg-[rgba(30,111,255,0.08)]',
  'Paused':      'text-ab-muted border-ab-border',
};

const ACCENT: Record<string, string> = {
  'In Progress': 'bg-ab-gold',
  'Completed':   'bg-ab-green',
  'In Review':   'bg-ab-blue',
  'Paused':      'bg-ab-muted',
};

const STATUSES = ['In Progress', 'In Review', 'Completed', 'Paused'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', client: 'Internal', description: '', deadline: '', budget: '', status: 'In Progress' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await fetch('/api/projects').then(r => r.json()).catch(() => []);
    setProjects(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p => {
    const matchFilter = filter === 'All' || p.client === filter || p.status === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: '', client: 'Internal', description: '', deadline: '', budget: '', status: 'In Progress' });
    setSaving(false);
    load();
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">Project <span className="text-brand-gold">Pipeline</span></h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Task Management & Revenue Tracking // Forge OS Agency
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-charcoal hover:bg-brand-ink text-ab-body font-black uppercase text-[10px] px-6 py-2 rounded-lg tracking-widest transition-all italic flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> New Project
          </button>
        </div>
      </div>

      {/* New Project Form */}
      {showForm && (
        <div data-reveal="0" className="forge-panel !rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="forge-heading text-base">New Project</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-brand-medium-gray" /></button>
          </div>
          <form onSubmit={createProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Project Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-gold uppercase" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Client</label>
              <input value={form.client} onChange={e => setForm(p => ({...p, client: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Budget</label>
              <input value={form.budget} onChange={e => setForm(p => ({...p, budget: e.target.value}))} placeholder="$4,500"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-mono text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold resize-none" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="forge-button disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div data-reveal="1" className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-brand-medium-gray border-b border-brand-warm-gray pb-6">
        {['All', 'Internal', 'Forge Agency'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`transition-colors ${filter === f ? 'text-brand-gold border-b border-brand-gold pb-6 -mb-[25px]' : 'hover:text-brand-ink'}`}>
            {f}
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium-gray" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Projects..."
            className="bg-ab-surface border border-ab-border rounded-lg pl-9 pr-4 py-2 text-[10px] focus:outline-none focus:border-ab-gold w-64 uppercase tracking-tighter text-ab-body" />
        </div>
      </div>

      {/* Project Grid */}
      <div data-reveal="2" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-ab-surface border border-ab-border rounded-2xl p-6 h-48 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="md:col-span-3 text-center py-16 text-[11px] font-mono text-brand-medium-gray uppercase tracking-widest">
            No projects found.
          </div>
        ) : filtered.map((project) => (
          <div key={project.id} className="bg-ab-surface border border-ab-border rounded-2xl p-6 hover:border-ab-gold/60 transition-all group cursor-pointer relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${ACCENT[project.status] ?? 'bg-brand-medium-gray'}`} />
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[9px] font-mono text-brand-medium-gray uppercase mb-1 tracking-widest">{project.client ?? 'Internal'}</div>
                <h3 className="text-base font-black text-brand-ink uppercase tracking-tighter group-hover:text-brand-gold transition-colors">{project.name}</h3>
              </div>
            </div>
            {project.description && (
              <p className="text-[11px] text-brand-slate italic mb-4 line-clamp-2">{project.description}</p>
            )}
            <div className="space-y-2 mb-4">
              {project.deadline && (
                <div className="flex justify-between text-[10px] font-mono border-b border-brand-warm-gray pb-2">
                  <span className="text-brand-medium-gray flex items-center gap-1"><Clock className="w-3 h-3" /> Deadline</span>
                  <span className="text-brand-ink">{project.deadline}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] font-mono border-b border-brand-warm-gray pb-2">
                <span className="text-brand-medium-gray flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Status</span>
                <span className={`font-bold ${STATUS_STYLES[project.status]?.split(' ')[0] ?? 'text-brand-gold'}`}>{project.status}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-base font-black text-brand-ink italic">{project.budget ?? 'N/A'}</div>
              <button className="p-2 border border-brand-warm-gray rounded-lg hover:bg-brand-gold hover:text-ab-body hover:border-brand-gold transition-all">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


