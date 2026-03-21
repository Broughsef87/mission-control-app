"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Zap, AlertCircle } from 'lucide-react';

interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  path?: string;
  model?: string;
  tokens?: number;
  cost?: number;
  created_at: string;
}

interface AgentStatus {
  agent_name: string;
  status: string;
  task?: string;
  last_seen: string;
}

export default function LiveAgentFeed() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const [connected, setConnected] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const sb = createClient(url, key);

    // Initial load
    async function loadInitial() {
      const { data } = await sb
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      setLogs((data ?? []).reverse());

      const { data: st } = await sb
        .from('agent_status')
        .select('*')
        .order('last_seen', { ascending: false });
      setStatuses(st ?? []);
    }
    loadInitial();

    // Real-time subscription
    const channel = sb
      .channel('agent-feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_logs',
      }, (payload) => {
        setLogs(prev => [...prev.slice(-49), payload.new as AgentLog]);
        setTimeout(() => {
          feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_status',
      }, async () => {
        const { data } = await sb.from('agent_status').select('*').order('last_seen', { ascending: false });
        setStatuses(data ?? []);
      })
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => { sb.removeChannel(channel); };
  }, []);

  const activeCount = statuses.filter(s => s.status === 'Working').length;

  return (
    <div className="forge-panel space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-brand-gold" />
          <h2 className="forge-heading text-lg">Live Agent Feed</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-brand-warm-gray'}`} />
          <span className="text-[9px] font-mono text-brand-medium-gray uppercase tracking-widest">
            {connected ? `${activeCount} Active` : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Agent Status Pills */}
      {statuses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {statuses.map(agent => (
            <div key={agent.agent_name} className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-parchment border border-brand-warm-gray rounded-full">
              <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Working' ? 'bg-green-500' : agent.status === 'Error' ? 'bg-red-500' : 'bg-brand-warm-gray'}`} />
              <span className="text-[9px] font-mono font-bold text-brand-slate uppercase tracking-wide">{agent.agent_name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Activity Log */}
      <div ref={feedRef} className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-6 h-6 text-brand-warm-gray mx-auto mb-2" />
            <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest">
              No activity yet. Agents will appear here in real-time.
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 py-2 border-b border-brand-warm-gray/50 group hover:bg-brand-parchment/50 -mx-1 px-1 rounded-lg transition-colors">
              <Zap className="w-3 h-3 text-brand-gold mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-mono font-bold text-brand-gold uppercase">{log.agent_name}</span>
                  {log.model && (
                    <span className="text-[8px] font-mono text-brand-medium-gray uppercase opacity-60">{log.model}</span>
                  )}
                </div>
                <p className="text-[10px] text-brand-slate font-sans leading-snug truncate">{log.action}</p>
                {log.path && (
                  <p className="text-[8px] font-mono text-brand-medium-gray truncate opacity-70">{log.path}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                {log.cost != null && Number(log.cost) > 0 && (
                  <div className="text-[8px] font-mono text-brand-medium-gray">${Number(log.cost).toFixed(4)}</div>
                )}
                <div className="text-[8px] font-mono text-brand-medium-gray opacity-60">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
