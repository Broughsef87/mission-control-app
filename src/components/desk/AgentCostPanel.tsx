"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 5 * 60 * 1000;

interface WeekBurn {
  start: string;
  claude: number;
  apollo: number;
  stripe: number;
  total: number;
}

interface CostData {
  totalMTD: number;
  totalTokens: number;
  weeklyBurn: {
    thisWeek: WeekBurn;
    priorWeek: WeekBurn;
    trendPct: number | null;
  };
  error?: string;
}

function fmt(n: number) {
  return n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}`;
}

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct > 0;
  const color = up ? 'var(--ab-red)' : 'var(--ab-green)';
  return (
    <span className="text-[8px] font-mono tabular-nums" style={{ color }}>
      {up ? '↑' : '↓'}{Math.abs(pct)}%
    </span>
  );
}

export default function AgentCostPanel() {
  const { data, isValidating } = useSWR<CostData>('/api/agent-costs', fetcher, {
    refreshInterval: REFRESH,
    revalidateOnFocus: false,
  });

  return (
    <div className="forge-panel flex flex-col gap-2">
      <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
        <span className="forge-label">Agent Burn</span>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--ab-muted)', border: '1px solid var(--ab-border)' }}>5m</span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: isValidating ? 'var(--ab-gold)' : 'var(--ab-green)', animation: isValidating ? 'pulse-glow 1s ease-in-out infinite' : undefined }} />
        </div>
      </div>

      {!data && (
        <div className="flex flex-col gap-2">
          <div className="h-10 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
          <div className="h-10 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
        </div>
      )}

      {data?.error && (
        <p className="text-[9px] font-mono" style={{ color: 'var(--ab-red)' }}>{data.error}</p>
      )}

      {data && !data.error && (
        <>
          {/* MTD summary */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded" style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}>
            <span className="text-[8px] font-mono uppercase tracking-wider" style={{ color: 'var(--ab-muted)' }}>MTD Claude API</span>
            <span className="text-[14px] font-mono font-black tabular-nums" style={{ color: 'var(--ab-text)' }}>{fmt(data.totalMTD)}</span>
          </div>

          {/* Week over week */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--ab-muted)' }}>This week</span>
              <div className="flex items-center gap-1.5">
                <TrendBadge pct={data.weeklyBurn.trendPct} />
                <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: 'var(--ab-text)' }}>{fmt(data.weeklyBurn.thisWeek.total)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--ab-border-bright)' }}>Prior week</span>
              <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--ab-muted)' }}>{fmt(data.weeklyBurn.priorWeek.total)}</span>
            </div>
          </div>

          {/* Breakdown */}
          {(data.weeklyBurn.thisWeek.apollo > 0 || data.weeklyBurn.thisWeek.stripe > 0) && (
            <div className="flex flex-col gap-0.5 pt-1" style={{ borderTop: '1px solid var(--ab-border)' }}>
              <span className="text-[7px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--ab-muted)' }}>Weekly breakdown</span>
              <CostLine label="Claude" value={data.weeklyBurn.thisWeek.claude} />
              {data.weeklyBurn.thisWeek.apollo > 0 && <CostLine label="Apollo" value={data.weeklyBurn.thisWeek.apollo} />}
              {data.weeklyBurn.thisWeek.stripe > 0 && <CostLine label="Stripe" value={data.weeklyBurn.thisWeek.stripe} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>{label}</span>
      <span className="text-[8px] font-mono tabular-nums" style={{ color: 'var(--ab-text)' }}>{fmt(value)}</span>
    </div>
  );
}
