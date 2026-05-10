"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSupabaseClient } from '@/lib/supabase';

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

const severityStyles = {
  critical: {
    border: 'border-ab-red/30',
    bg: 'bg-ab-red/8',
    dot: 'dot dot-red',
    label: 'text-ab-red',
    badge: 'SYSTEM ALERT',
  },
  warning: {
    border: 'border-ab-gold/30',
    bg: 'bg-ab-gold/8',
    dot: 'dot dot-gold',
    label: 'text-ab-gold',
    badge: 'WARNING',
  },
  info: {
    border: 'border-ab-blue/30',
    bg: 'bg-ab-blue/8',
    dot: 'dot',
    label: 'text-ab-muted',
    badge: 'INFO',
  },
};

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function load() {
    const data = await fetch('/api/alerts').then(r => r.json()).catch(() => []);
    setAlerts(Array.isArray(data) ? data.filter((a: Alert) => !a.resolved) : []);
  }

  async function dismiss(id: string) {
    await fetch(`/api/alerts/${id}/resolve`, { method: 'PATCH' });
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  useEffect(() => {
    load();
    const sb = getSupabaseClient();
    const channel = sb
      .channel('alerts-banner')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => load())
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map(alert => {
        const s = severityStyles[alert.severity] ?? severityStyles.info;
        return (
          <div key={alert.id}
            className={`border ${s.border} rounded-md p-4 flex items-start gap-3`}
            style={{ background: alert.severity === 'critical' ? 'rgba(220,38,38,0.08)' : alert.severity === 'warning' ? 'rgba(232,163,32,0.08)' : 'rgba(30,111,255,0.08)' }}
          >
            <span className={`${s.dot} mt-1 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`font-mono text-[10px] tracking-[0.14em] uppercase font-bold ${s.label}`}>{s.badge}</span>
                <span className="font-mono text-[9px] text-ab-muted uppercase">— {alert.source}</span>
                <span className="font-mono text-[9px] text-ab-muted ml-auto">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-ab-body-text">{alert.message}</p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="font-mono text-[10px] text-ab-muted hover:text-ab-body shrink-0 ml-2 flex items-center gap-1"
              title="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
