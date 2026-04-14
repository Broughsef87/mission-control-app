"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Mail, Calendar, CheckSquare, Clock, ArrowUpRight, Search, FileText, Bell, CheckCheck, CheckCircle2, XCircle, Inbox } from 'lucide-react';
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

interface Approval {
  id: string;
  title: string;
  description?: string;
  requested_by?: string;
  priority?: string;
  created_at: string;
  status: string;
}

interface CheckinPriority {
  text: string;
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

export default function OfficePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [priorities, setPriorities] = useState<CheckinPriority[]>([]);
  const [checkinDate, setCheckinDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    const [notifData, approvalData, checkinData] = await Promise.all([
      fetch('/api/notifications').then(r => r.json()).catch(() => []),
      fetch('/api/approvals').then(r => r.json()).catch(() => []),
      fetch(`/api/checkin?date=${today}`).then(r => r.json()).catch(() => null),
    ]);

    setNotifications(notifData ?? []);
    setApprovals((approvalData ?? []).filter((a: Approval) => a.status === 'pending'));

    if (checkinData?.exists && checkinData?.parsed?.priorities?.length) {
      setPriorities(checkinData.parsed.priorities.map((p: string) => ({ text: p })));
      setCheckinDate(today);
    } else {
      // fall back to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yd = yesterday.toISOString().split('T')[0];
      const fallback = await fetch(`/api/checkin?date=${yd}`).then(r => r.json()).catch(() => null);
      if (fallback?.exists && fallback?.parsed?.priorities?.length) {
        setPriorities(fallback.parsed.priorities.map((p: string) => ({ text: p })));
        setCheckinDate(yd);
      }
    }

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

  async function resolveApproval(id: string, status: 'approved' | 'denied') {
    await fetch('/api/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setApprovals(prev => prev.filter(a => a.id !== id));
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body?.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date();
  const dateNum = today.getDate();
  const dateMonth = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

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

          {/* Pending Approvals */}
          <div className="pt-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <CheckSquare className="w-3 h-3 text-brand-gold" /> Pending Approvals
              {approvals.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-full">{approvals.length}</span>
              )}
            </h2>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-14 bg-brand-warm-gray rounded-xl animate-pulse" />
              ))
            ) : approvals.length === 0 ? (
              <div className="text-center py-8">
                <Inbox className="w-5 h-5 text-brand-warm-gray mx-auto mb-2" />
                <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">No pending approvals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {approvals.map((approval) => (
                  <div key={approval.id} className="flex items-center gap-4 p-4 bg-white border border-brand-warm-gray rounded-xl group hover:border-brand-gold/40 transition-all">
                    <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg italic tracking-widest ${approval.priority === 'high' ? 'bg-brand-gold text-white' : 'border border-brand-warm-gray text-brand-medium-gray'}`}>
                      {approval.priority ?? 'Review'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors truncate">{approval.title}</div>
                      {approval.description && (
                        <div className="text-[9px] font-mono text-brand-medium-gray uppercase mt-0.5 truncate">{approval.description}</div>
                      )}
                      <div className="text-[8px] font-mono text-brand-medium-gray mt-0.5">
                        {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => resolveApproval(approval.id, 'approved')}
                        className="flex items-center gap-1 text-[8px] font-mono font-black text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => resolveApproval(approval.id, 'denied')}
                        className="flex items-center gap-1 text-[8px] font-mono font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule / Priorities */}
        <div data-reveal="2" className="space-y-6">
          <div className="bg-white border border-brand-warm-gray rounded-2xl p-6 space-y-6 relative overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-brand-slate flex items-center gap-3">
              <Calendar className="w-3 h-3 text-brand-gold" /> Today's Focus
            </h2>

            {/* Date block */}
            <div className="flex gap-4 items-center">
              <div className="flex flex-col items-center">
                <div className="text-lg font-black text-brand-ink italic">{dateNum}</div>
                <div className="text-[8px] font-mono text-brand-gold uppercase tracking-widest font-bold">{dateMonth}</div>
              </div>
              <div className="flex-1 border-l border-brand-warm-gray pl-4">
                <div className="text-[10px] font-black text-brand-ink uppercase tracking-widest mb-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                <div className="text-[8px] font-mono text-brand-medium-gray uppercase italic">
                  {checkinDate ? `Check-in: ${checkinDate}` : 'No check-in found'}
                </div>
              </div>
            </div>

            {/* Priorities from check-in */}
            <div className="space-y-3">
              <div className="text-[8px] font-black uppercase text-brand-medium-gray tracking-widest italic border-b border-brand-warm-gray pb-2 flex justify-between items-center">
                First Move <Clock className="w-3 h-3" />
              </div>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-5 bg-brand-warm-gray rounded animate-pulse" />
                ))
              ) : priorities.length === 0 ? (
                <p className="text-[10px] font-mono text-brand-medium-gray italic">No check-in priorities found.</p>
              ) : priorities.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[9px] font-mono font-bold text-brand-gold shrink-0 mt-0.5">{i + 1}.</span>
                  <span className="text-[10px] font-bold text-brand-slate uppercase tracking-tight leading-snug">{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-brand-warm-gray rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-brand-gold/40 transition-all" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-brand-parchment border border-brand-warm-gray rounded-xl text-brand-gold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-ink uppercase tracking-tight group-hover:text-brand-gold transition-colors">Forge OS Assets</div>
                <div className="text-[8px] font-mono text-brand-medium-gray uppercase">Google Drive</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-brand-medium-gray group-hover:text-brand-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}
