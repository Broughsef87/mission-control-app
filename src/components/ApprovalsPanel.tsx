"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Approval {
  id: string;
  agent_name: string;
  action_type: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function ApprovalsPanel() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await fetch('/api/approvals').then(r => r.json()).catch(() => []);
    setApprovals(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: string, status: 'approved' | 'denied') {
    await fetch('/api/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  if (loading) return <div className="forge-panel h-16 animate-pulse" />;
  if (approvals.length === 0) return null;

  return (
    <div className="forge-panel space-y-4" style={{ borderColor: 'var(--color-brand-gold)', backgroundColor: 'rgba(var(--color-brand-gold-rgb, 196,160,100),0.05)' }}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-gold animate-pulse" />
        <h2 className="forge-heading text-base">Pending Approvals</h2>
        <span className="ml-auto text-[9px] font-mono font-bold bg-brand-gold text-white px-2 py-0.5 rounded-full">
          {approvals.length}
        </span>
      </div>
      <div className="space-y-3">
        {approvals.map(a => (
          <div key={a.id} className="bg-white border border-brand-warm-gray rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono font-bold text-brand-gold uppercase">{a.agent_name}</span>
                  <span className="text-[8px] font-mono text-brand-medium-gray bg-brand-warm-gray px-1.5 py-0.5 rounded uppercase">{a.action_type}</span>
                </div>
                <div className="text-sm font-bold text-brand-ink uppercase tracking-tight mt-1">{a.title}</div>
                {a.description && <div className="text-[11px] text-brand-slate italic mt-1">{a.description}</div>}
                <div className="text-[8px] font-mono text-brand-medium-gray mt-1">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}
