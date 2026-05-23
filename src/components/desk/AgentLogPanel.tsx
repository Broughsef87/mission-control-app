"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 30 * 60 * 1000;

interface AgentStat {
  name: string;
  actions: number;
  cost: number;
  tokens: number;
  last_action: string;
  last_at: string;
}

interface LogData {
  bullets: string[];
  total_actions: number;
  total_cost_formatted: string;
  total_tokens: number;
  agents: AgentStat[];
  since: string;
  as_of: string;
  error?: string;
}

export default function AgentLogPanel() {
  const { data, isValidating } = useSWR<LogData>(
    '/api/morning-desk/agent-log',
    fetcher,
    { refreshInterval: REFRESH, refreshWhenHidden: true, revalidateOnFocus: true }
  );

  return (
    <div className="forge-panel flex flex-col gap-0 h-full">
      <PanelHeader label="Agent Overnight Log" cadence="30m" validating={isValidating} asOf={data?.as_of} />

      {!data && (
        <div className="flex flex-col gap-2 mt-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 rounded animate-pulse" style={{ background: 'var(--ab-border)', width: `${60 + i * 7}%` }} />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Summary strip */}
          <div className="flex items-center gap-3 mt-2 mb-3">
            <div className="flex flex-col">
              <span className="text-lg font-mono font-black tabular-nums leading-none" style={{ color: 'var(--ab-text)' }}>{data.total_actions}</span>
              <span className="text-[8px] font-mono uppercase" style={{ color: 'var(--ab-muted)' }}>actions</span>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--ab-border)' }} />
            <div className="flex flex-col">
              <span className="text-lg font-mono font-black tabular-nums leading-none" style={{ color: 'var(--ab-gold)' }}>{data.total_cost_formatted}</span>
              <span className="text-[8px] font-mono uppercase" style={{ color: 'var(--ab-muted)' }}>cost</span>
            </div>
            <div style={{ width: 1, height: 28, background: 'var(--ab-border)' }} />
            <div className="flex flex-col">
              <span className="text-lg font-mono font-black tabular-nums leading-none" style={{ color: 'var(--ab-text)' }}>{data.agents?.length || 0}</span>
              <span className="text-[8px] font-mono uppercase" style={{ color: 'var(--ab-muted)' }}>agents</span>
            </div>
          </div>

          {/* 5 summary bullets */}
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {data.bullets.map((bullet, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--ab-muted)' }} />
                <span className="text-[10px] font-mono leading-snug" style={{ color: 'var(--ab-body-text)' }}>{bullet}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PanelHeader({ label, cadence, validating, asOf }: { label: string; cadence: string; validating: boolean; asOf?: string }) {
  return (
    <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
      <span className="forge-label">{label}</span>
      <div className="flex items-center gap-2">
        {asOf && (
          <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>
            {formatDistanceToNow(new Date(asOf), { addSuffix: true })}
          </span>
        )}
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--ab-muted)', border: '1px solid var(--ab-border)' }}>{cadence}</span>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: validating ? 'var(--ab-gold)' : 'var(--ab-green)', animation: validating ? 'pulse-glow 1s ease-in-out infinite' : undefined }} />
      </div>
    </div>
  );
}
