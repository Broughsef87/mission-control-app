"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Mail, Calendar, CheckSquare, Clock, ArrowUpRight, Search, FileText, Bell, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  source: string;
  read: boolean;
  created_at: string;
}

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-white border-brand-warm-gray',
};

const TYPE_DOTS: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-brand-gold',
};

const tasks = [
  { title: 'Approve Forge OS Landing Page Copy', time: '09:00 AM', priority: 'High', type: 'Review' },
  { title: 'Update TODO.md for Autonomous Content', time: '11:30 AM', priority: 'Medium', type: 'Dev' },
  { title: 'Check B2B Agency Leads', time: '02:00 PM', priority: 'High', type: 'Sales' },
];

export default function OfficePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await fetch('/api/notifications').then(r => r.json()).catch(() => []);
    setNotifications(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    await fetch('/api/notifications?all=true', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div data-reveal="0" className="flex justify-between items-end border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-3xl">Virtual <span className="text-brand-gold">Office</span></h1>
          <p className="text-xs font-mono text-brand-medium-gray uppercase tracking-widest mt-1">
            Communication & Administration // Forge OS Headquarters
          </p>
        </div>
        <div className="relative">
          <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium-gray" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-white border border-brand-warm-gray rounded-lg pl-9 pr-4 py-2 text-[10px] focus:outline-none focus:border-brand-gold w-48 uppercase tracking-tighter text-brand-ink" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inbox / Notifications */}
        <div data-reveal="1" className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <Mail className="w-3 h-3 text-brand-gold" /> Neural Inbox
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-brand-gold text-white text-[8px] font-black rounded-full">{unreadCount}</span>
              )}
            </h2>
            <button onClick={markAllRead} className="flex items-center gap-1 text-[8px] font-mono text-brand-medium-gray uppercase hover:text-brand-ink transition-colors tracking-widest">
              <CheckCheck className="w-3 h-3" /> Mark All Read
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-brand-warm-gray rounded-xl animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-6 h-6 text-brand-warm-gray mx-auto mb-2" />
                <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">Inbox is clear.</p>
              </div>
            ) : filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => !msg.read && markRead(msg.id)}
                className={`p-4 border rounded-xl flex items-center justify-between hover:border-brand-gold/40 transition-all cursor-pointer group ${msg.read ? 'bg-white border-brand-warm-gray opacity-70' : TYPE_STYLES[msg.type] ?? TYPE_STYLES.info}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 rounded-full ${msg.read ? 'bg-brand-warm-gray' : TYPE_DOTS[msg.type] ?? 'bg-brand-gold'}`} />
                  <div>
                    <div className="text-[9px] font-mono text-brand-medium-gray uppercase mb-0.5">
                      {msg.source} <span className="mx-1 opacity-30">//</span>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </div>
                    <div className={`text-sm font-bold uppercase tracking-tight ${msg.read ? 'text-brand-slate' : 'text-brand-ink'}`}>
                      {msg.title}
                    </div>
                    {msg.body && <div className="text-[10px] text-brand-medium-gray mt-0.5 line-clamp-1">{msg.body}</div>}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-medium-gray group-hover:text-brand-gold shrink-0 ml-4" />
              </div>
            ))}
          </div>

          {/* Task Queue */}
          <div className="pt-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <CheckSquare className="w-3 h-3 text-brand-gold" /> Task Queue
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border border-brand-warm-gray rounded-xl group hover:border-brand-gold/40 transition-all">
                  <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg italic tracking-widest ${task.priority === 'High' ? 'bg-brand-gold text-white' : 'border border-brand-warm-gray text-brand-medium-gray'}`}>
                    {task.priority}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors">{task.title}</div>
                    <div className="text-[9px] font-mono text-brand-medium-gray uppercase mt-0.5">{task.type} <span className="mx-1 opacity-30">|</span> {task.time}</div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 border-brand-warm-gray accent-brand-gold" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar / Schedule */}
        <div data-reveal="2" className="space-y-6">
          <div className="bg-white border border-brand-warm-gray rounded-2xl p-6 space-y-8 relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <Calendar className="w-3 h-3 text-brand-gold" /> Schedule
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-lg font-black text-brand-ink italic">21</div>
                  <div className="text-[8px] font-mono text-brand-gold uppercase tracking-widest font-bold">MAR</div>
                </div>
                <div className="flex-1 border-l border-brand-warm-gray pl-4">
                  <div className="text-[10px] font-black text-brand-ink uppercase tracking-widest mb-1">Sunday Sprint</div>
                  <div className="text-[8px] font-mono text-brand-medium-gray uppercase italic">08:00 AM - 12:00 PM</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-[8px] font-black uppercase text-brand-medium-gray tracking-widest italic border-b border-brand-warm-gray pb-2 flex justify-between items-center">
                  Up Next <Clock className="w-3 h-3" />
                </div>
                <div className="text-[10px] font-bold text-brand-slate uppercase tracking-tight">Weekly Review & Planning</div>
                <div className="text-[10px] font-bold text-brand-medium-gray uppercase tracking-tight opacity-70">Content Production: Video 01</div>
                <div className="text-[10px] font-bold text-brand-gold/70 uppercase tracking-tight opacity-60">App Deployment Test</div>
              </div>
            </div>
            <button className="w-full bg-brand-parchment border border-brand-warm-gray rounded-lg hover:border-brand-gold text-brand-ink font-black uppercase text-[10px] py-3 tracking-widest transition-all italic mt-2">
              Open Full Calendar
            </button>
          </div>

          <div className="bg-white border border-brand-warm-gray rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-brand-gold/40 transition-all" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-parchment border border-brand-warm-gray rounded-xl text-brand-gold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors">Forge OS Assets</div>
                <div className="text-[8px] font-mono text-brand-medium-gray uppercase">24 files • 1.2 GB</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-brand-medium-gray group-hover:text-brand-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}
