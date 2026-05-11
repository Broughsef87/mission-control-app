"use client";

import React from 'react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface AgentLog {
  id: string;
  agent_name: string;
  action: string;
  path?: string;
  cost?: number;
  created_at: string;
}

interface CostData {
  recentLogs: AgentLog[];
}

function SynthesizedView({ logs }: { logs: AgentLog[] }) {
  // Group by agent, show latest action per agent
  const byAgent = new Map<string, AgentLog[]>();
  for (const log of logs) {
    const existing = byAgent.get(log.agent_name) ?? [];
    byAgent.set(log.agent_name, [...existing, log]);
  }

  return (
    <div className="space-y-3">
      {byAgent.size === 0 && (
        <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest text-center py-8">
          No agent activity logged yet.
        </p>
      )}
      {[...byAgent.entries()].map(([agent, agentLogs]) => {
        const latest = agentLogs[0];
        const totalCost = agentLogs.reduce((s, l) => s + (l.cost ?? 0), 0);
        return (
          <div key={agent} className="p-3 border border-brand-warm-gray bg-brand-parchment rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-bold text-brand-gold uppercase">{agent}</span>
              <div className="flex items-center gap-2">
                {totalCost > 0 && <span className="text-[8px] font-mono text-brand-medium-gray">${totalCost.toFixed(4)}</span>}
                <span className="text-[8px] font-mono text-brand-medium-gray opacity-60">
                  {agentLogs.length} action{agentLogs.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-brand-slate">{latest.action}</p>
            {latest.path && <p className="text-[8px] font-mono text-brand-medium-gray truncate">{latest.path}</p>}
            <p className="text-[8px] font-mono text-brand-medium-gray opacity-60 mt-0.5">
              {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function RawLogsView({ logs }: { logs: AgentLog[] }) {
  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {logs.length === 0 && (
        <p className="text-[10px] font-mono text-brand-medium-gray uppercase tracking-widest text-center py-8">
          No logs.
        </p>
      )}
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 py-2 border-b border-brand-warm-gray/50">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-brand-gold uppercase mr-2">{log.agent_name}</span>
            <span className="text-[10px] text-brand-slate">{log.action}</span>
            {log.path && <span className="text-[8px] font-mono text-brand-medium-gray ml-2 truncate block">{log.path}</span>}
          </div>
          <div className="text-right shrink-0">
            {(log.cost ?? 0) > 0 && <div className="text-[8px] font-mono text-brand-medium-gray">${Number(log.cost).toFixed(4)}</div>}
            <div className="text-[8px] font-mono text-brand-medium-gray opacity-60">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AgentLogsSection() {
  const [raw, setRaw] = React.useState(false);
  const { data, isValidating } = useSWR<CostData>('/api/agent-costs', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  const logs = data?.recentLogs ?? [];

  return (
    <div className="forge-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="forge-heading text-lg">Recent Activity</h2>
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isValidating ? 'var(--ab-gold)' : 'var(--ab-green)', animation: isValidating ? 'pulse-glow 1s ease-in-out infinite' : undefined }}
          />
          <button
            onClick={() => setRaw(r => !r)}
            style={{
              fontFamily: 'var(--ab-font-mono)',
              fontSize: '8px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: `1px solid ${raw ? 'var(--ab-gold)' : 'var(--ab-border)'}`,
              color: raw ? 'var(--ab-gold)' : 'var(--ab-muted)',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {raw ? 'Raw' : 'Summary'}
          </button>
        </div>
      </div>

      {!data && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
          ))}
        </div>
      )}

      {data && (raw ? <RawLogsView logs={logs} /> : <SynthesizedView logs={logs} />)}
    </div>
  );
}
