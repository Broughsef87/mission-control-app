"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Ticket, Plus, X, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Company { id: string; name: string; color: string; }
interface TicketRow {
  id: string; agent_name?: string; title: string; status: string; priority: string;
  created_at: string; resolved_at?: string;
  companies?: { name: string; color: string };
}
interface Message { id: string; role: string; content: string; created_at: string; }

const PRIORITY_STYLES: Record<string, string> = {
  low:    'text-brand-medium-gray',
  normal: 'text-brand-gold',
  high:   'text-red-500',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  open:        <Clock className="w-3 h-3 text-brand-gold" />,
  in_progress: <AlertCircle className="w-3 h-3 text-blue-500" />,
  resolved:    <CheckCircle2 className="w-3 h-3 text-green-500" />,
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTicket, setActiveTicket] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', agent_name: '', company_id: '', priority: 'normal' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTickets = useCallback(async () => {
    const [t, c] = await Promise.all([
      fetch(`/api/tickets?status=${statusFilter}`).then(r => r.json()).catch(() => []),
      fetch('/api/companies').then(r => r.json()).catch(() => []),
    ]);
    setTickets(t ?? []);
    setCompanies(c ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  async function openTicket(ticket: TicketRow) {
    setActiveTicket(ticket);
    const msgs = await fetch(`/api/tickets?ticket_id=${ticket.id}`).then(r => r.json()).catch(() => []);
    setMessages(msgs ?? []);
  }

  async function sendMessage() {
    if (!activeTicket || !newMsg.trim()) return;
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_id: activeTicket.id, role: 'human', content: newMsg.trim() }),
    });
    setNewMsg('');
    const msgs = await fetch(`/api/tickets?ticket_id=${activeTicket.id}`).then(r => r.json());
    setMessages(msgs ?? []);
  }

  async function resolveTicket(id: string) {
    await fetch('/api/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'resolved' }),
    });
    setActiveTicket(null);
    loadTickets();
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, company_id: form.company_id || null }),
    });
    setShowForm(false);
    setForm({ title: '', agent_name: '', company_id: '', priority: 'normal' });
    setSaving(false);
    loadTickets();
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <header data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-8">
        <div>
          <h1 className="forge-heading text-4xl lg:text-5xl mb-2">
            Task <span className="text-brand-gold">Tickets</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.3em]">
            Agent Work Log — Persistent Task Threads
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-charcoal hover:bg-brand-ink text-white font-black uppercase text-[10px] px-5 py-2 rounded-lg tracking-widest transition-all italic flex items-center gap-2"
        >
          <Plus className="w-3 h-3" /> New Ticket
        </button>
      </header>

      {showForm && (
        <div className="forge-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="forge-heading text-base flex items-center gap-2"><Ticket className="w-4 h-4 text-brand-gold" /> New Ticket</h3>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-brand-medium-gray" /></button>
          </div>
          <form onSubmit={createTicket} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Task Title *</label>
              <input required value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm font-bold text-brand-ink focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Assigned Agent</label>
              <input value={form.agent_name} onChange={e => setForm(p => ({...p, agent_name: e.target.value}))} placeholder="e.g. charles"
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold" />
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
              <label className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest block mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}
                className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg p-2.5 text-sm text-brand-ink focus:outline-none focus:border-brand-gold">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="forge-button disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter */}
          <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest">
            {['open', 'in_progress', 'resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`transition-colors ${statusFilter === s ? 'text-brand-gold' : 'text-brand-medium-gray hover:text-brand-ink'}`}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            Array.from({length: 4}).map((_, i) => <div key={i} className="h-16 bg-brand-warm-gray rounded-xl animate-pulse" />)
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-6 h-6 text-brand-warm-gray mx-auto mb-2" />
              <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">No {statusFilter} tickets</p>
            </div>
          ) : tickets.map(t => (
            <button
              key={t.id}
              onClick={() => openTicket(t)}
              className={`w-full text-left forge-panel hover:border-brand-gold/40 transition-all space-y-2 ${activeTicket?.id === t.id ? 'border-brand-gold' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {STATUS_ICON[t.status]}
                  <span className="text-sm font-black text-brand-ink uppercase tracking-tight line-clamp-1">{t.title}</span>
                </div>
                <span className={`text-[8px] font-mono uppercase font-bold shrink-0 ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
              </div>
              <div className="flex items-center gap-3 text-[8px] font-mono text-brand-medium-gray">
                {t.agent_name && <span className="font-bold uppercase text-brand-gold">{t.agent_name}</span>}
                {t.companies && <span style={{ color: t.companies.color }}>{t.companies.name}</span>}
                <span className="ml-auto">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Thread View */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="forge-panel h-full flex flex-col min-h-[500px]">
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-brand-warm-gray">
                <div>
                  <h3 className="font-black text-brand-ink uppercase tracking-tight text-base">{activeTicket.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[8px] font-mono text-brand-medium-gray">
                    {activeTicket.agent_name && <span className="text-brand-gold font-bold uppercase">{activeTicket.agent_name}</span>}
                    <span>{formatDistanceToNow(new Date(activeTicket.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                {activeTicket.status !== 'resolved' && (
                  <button
                    onClick={() => resolveTicket(activeTicket.id)}
                    className="text-[9px] font-mono font-bold uppercase tracking-widest text-green-600 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all"
                  >
                    Resolve
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-80 mb-4">
                {messages.length === 0 ? (
                  <p className="text-[10px] font-mono text-brand-medium-gray text-center py-8 uppercase tracking-widest">No messages yet</p>
                ) : messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'human' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${m.role === 'human' ? 'bg-brand-charcoal text-white' : m.role === 'system' ? 'bg-brand-warm-gray text-brand-medium-gray italic' : 'bg-brand-parchment border border-brand-warm-gray text-brand-ink'}`}>
                      <div className="text-[9px] font-mono font-bold uppercase mb-1 opacity-60">{m.role}</div>
                      <div className="text-xs whitespace-pre-wrap">{m.content}</div>
                      <div className="text-[7px] font-mono opacity-40 mt-1">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {activeTicket.status !== 'resolved' && (
                <div className="flex gap-2 pt-4 border-t border-brand-warm-gray">
                  <input
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Add a note or instruction..."
                    className="flex-1 bg-brand-parchment border border-brand-warm-gray rounded-lg px-3 py-2 text-sm text-brand-ink focus:outline-none focus:border-brand-gold"
                  />
                  <button onClick={sendMessage} className="forge-button !py-2 !px-4 shrink-0">
                    <MessageSquare className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="forge-panel h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Ticket className="w-8 h-8 text-brand-warm-gray mx-auto mb-3" />
                <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Select a ticket to view thread</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
