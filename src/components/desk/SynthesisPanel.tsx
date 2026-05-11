"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface SignalItem {
  label: string;
  weight: number;
  source: string;
  link?: string;
}

interface RevenueSignal {
  label: string;
  value: string | number;
  alert?: boolean;
}

interface WatchItem {
  id: string;
  label: string;
  source: string;
  type: string;
  dueDate?: string;
}

interface DecisionItem {
  id: string;
  label: string;
  source: string;
  created_at?: string;
}

interface AccountabilityItem {
  id: string;
  label: string;
  source: string;
}

interface SummaryData {
  date: string;
  top3: SignalItem[];
  decisionsNeeded: DecisionItem[];
  watchThis: WatchItem[];
  revenueSignals: RevenueSignal[];
  calendarPrep: any[];
  agentUpdates: any[];
  accountability: {
    yesterdayCommitments: AccountabilityItem[];
    completed: AccountabilityItem[];
    missed: AccountabilityItem[];
  } | null;
  meta: { generatedAt: string; sourceStatus: Record<string, string> };
}

const SOURCE_COLORS: Record<string, string> = {
  stripe:     'var(--ab-green)',
  linear:     '#7c5cbf',
  calendar:   '#4285f4',
  approvals:  'var(--ab-gold)',
  agent_logs: 'var(--ab-muted)',
  checkin:    'var(--ab-muted)',
};

function SectionLabel({ children, urgent }: { children: React.ReactNode; urgent?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-0.5">
      {urgent && <div className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--ab-red)' }} />}
      <span className="text-[8px] font-mono tracking-[0.2em] uppercase" style={{ color: urgent ? 'var(--ab-red)' : 'var(--ab-muted)' }}>
        {children}
      </span>
    </div>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span
      className="text-[7px] font-mono px-1 py-0.5 rounded uppercase tracking-wider"
      style={{ color: SOURCE_COLORS[source] ?? 'var(--ab-muted)', border: `1px solid ${SOURCE_COLORS[source] ?? 'var(--ab-border)'}`, opacity: 0.8 }}
    >
      {source}
    </span>
  );
}

function WeightBadge({ weight }: { weight: number }) {
  const color = weight >= 85 ? 'var(--ab-red)' : weight >= 60 ? 'var(--ab-gold)' : 'var(--ab-muted)';
  return (
    <span className="text-[7px] font-mono tabular-nums" style={{ color }}>
      w{weight}
    </span>
  );
}

function SignalRow({ label, sub, accent }: { label: string; sub: string; accent?: string }) {
  return (
    <div className="flex items-start gap-2 px-2 py-1.5 rounded" style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}>
      <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: accent ?? 'var(--ab-muted)' }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono leading-snug truncate" style={{ color: 'var(--ab-text)' }}>{label}</p>
        <p className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>{sub}</p>
      </div>
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 rounded animate-pulse" style={{ background: 'var(--ab-border)', width: '100%' }} />
      ))}
    </>
  );
}

export default function SynthesisPanel() {
  const { data, isValidating } = useSWR<SummaryData>('/api/morning-desk/summary', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  const degraded = data
    ? Object.entries(data.meta.sourceStatus).filter(([, v]) => v !== 'ok' && v !== 'not configured')
    : [];

  return (
    <div className="flex flex-col gap-3">

      {/* Engine header */}
      <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
        <span className="text-[8px] font-mono tracking-[0.25em] uppercase" style={{ color: 'var(--ab-muted)' }}>
          SYNTHESIS ENGINE
        </span>
        <div className="flex items-center gap-2">
          {data?.meta.generatedAt && (
            <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>
              {formatDistanceToNow(new Date(data.meta.generatedAt), { addSuffix: true })}
            </span>
          )}
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isValidating ? 'var(--ab-gold)' : 'var(--ab-green)',
              animation: isValidating ? 'pulse-glow 1s ease-in-out infinite' : undefined,
            }}
          />
        </div>
      </div>

      {/* Degraded source badges */}
      {degraded.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {degraded.map(([source, msg]) => (
            <span
              key={source}
              className="px-1.5 py-0.5 rounded text-[8px] font-mono"
              style={{ background: 'rgba(220,38,38,0.1)', color: 'var(--ab-red)', border: '1px solid rgba(220,38,38,0.25)' }}
            >
              {source}: {msg}
            </span>
          ))}
        </div>
      )}

      {/* TOP 3 */}
      <div className="flex flex-col gap-1.5">
        <SectionLabel>TOP 3 TODAY</SectionLabel>
        {!data && <SkeletonRows count={3} />}
        {data?.top3.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-3 py-2.5 rounded"
            style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}
          >
            <span
              className="font-mono font-black tabular-nums leading-none shrink-0"
              style={{ color: 'var(--ab-gold)', fontSize: '1.5rem', minWidth: '2ch', lineHeight: 1 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-mono leading-snug" style={{ color: 'var(--ab-text)' }}>{item.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <SourceBadge source={item.source} />
                <WeightBadge weight={item.weight} />
              </div>
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono shrink-0"
                style={{ color: 'var(--ab-muted)' }}
              >
                ↗
              </a>
            )}
          </div>
        ))}
        {data?.top3.length === 0 && (
          <p className="text-[10px] font-mono py-2 px-2" style={{ color: 'var(--ab-muted)' }}>No signals — all clear.</p>
        )}
      </div>

      {/* DECISIONS NEEDED — hidden when empty */}
      {data && data.decisionsNeeded.length > 0 && (
        <div className="flex flex-col gap-1">
          <SectionLabel urgent>DECISIONS NEEDED</SectionLabel>
          {data.decisionsNeeded.map((d, i) => (
            <SignalRow
              key={d.id ?? i}
              label={d.label}
              sub={`${d.source}${d.created_at ? ' · ' + formatDistanceToNow(new Date(d.created_at), { addSuffix: true }) : ''}`}
              accent="var(--ab-red)"
            />
          ))}
        </div>
      )}

      {/* WATCH THIS — hidden when empty */}
      {data && data.watchThis.length > 0 && (
        <div className="flex flex-col gap-1">
          <SectionLabel>WATCH THIS</SectionLabel>
          {data.watchThis.slice(0, 6).map((w, i) => (
            <SignalRow
              key={w.id ?? i}
              label={w.label}
              sub={`${w.source} · ${w.type}${w.dueDate ? ' · due ' + w.dueDate : ''}`}
              accent={w.type === 'blocked' ? 'var(--ab-red)' : 'var(--ab-gold)'}
            />
          ))}
        </div>
      )}

      {/* REVENUE SIGNALS — hidden when empty */}
      {data && data.revenueSignals.length > 0 && (
        <div className="flex flex-col gap-1">
          <SectionLabel>REVENUE SIGNALS</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {data.revenueSignals.map((r, i) => (
              <div
                key={i}
                className="px-2 py-1.5 rounded"
                style={{
                  background: 'var(--ab-surface-2)',
                  border: `1px solid ${r.alert ? 'rgba(220,38,38,0.4)' : 'var(--ab-border)'}`,
                }}
              >
                <p className="text-[8px] font-mono uppercase tracking-wider" style={{ color: 'var(--ab-muted)' }}>{r.label}</p>
                <p className="text-[15px] font-mono font-black tabular-nums" style={{ color: r.alert ? 'var(--ab-red)' : 'var(--ab-text)' }}>
                  {r.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCOUNTABILITY */}
      {data?.accountability && (
        <div className="flex flex-col gap-1">
          <SectionLabel>YESTERDAY</SectionLabel>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded" style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}>
            <span className="text-[10px] font-mono" style={{ color: 'var(--ab-green)' }}>
              ✓ {data.accountability.completed.length} done
            </span>
            <span className="text-[10px] font-mono" style={{ color: data.accountability.missed.length > 0 ? 'var(--ab-red)' : 'var(--ab-muted)' }}>
              ✗ {data.accountability.missed.length} missed
            </span>
          </div>
          {data.accountability.missed.slice(0, 3).map((m, i) => (
            <p key={m.id ?? i} className="text-[9px] font-mono px-2" style={{ color: 'var(--ab-muted)' }}>
              — {m.label}
            </p>
          ))}
        </div>
      )}

    </div>
  );
}
