"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 10 * 60 * 1000;

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  deadline: string | null;
  updated_at: string;
}

interface WorkData {
  configured: boolean;
  linear_connected: boolean;
  in_progress_count: number;
  blocked_count: number;
  overdue_count: number;
  by_project: Project[];
  stale_note: string[];
  as_of: string;
  error?: string;
}

export default function WorkStatusPanel() {
  const { data, isValidating } = useSWR<WorkData>(
    '/api/morning-desk/work-status',
    fetcher,
    { refreshInterval: REFRESH, revalidateOnFocus: false }
  );

  const hasIssues = data && (data.blocked_count > 0 || data.overdue_count > 0);

  return (
    <div className="forge-panel flex flex-col gap-0 h-full">
      <PanelHeader label="Live Work Status" cadence="10m" validating={isValidating} asOf={data?.as_of} />

      {!data && (
        <div className="flex flex-col gap-2 mt-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 rounded animate-pulse" style={{ background: 'var(--ab-border)', width: `${65 + i * 8}%` }} />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
            <StatChip label="In Progress" value={data.in_progress_count} color="var(--ab-text)" />
            <StatChip label="Blocked" value={data.blocked_count} color={data.blocked_count > 0 ? 'var(--ab-red)' : 'var(--ab-muted)'} />
            <StatChip label="Overdue" value={data.overdue_count} color={data.overdue_count > 0 ? 'var(--ab-gold)' : 'var(--ab-muted)'} />
          </div>

          {!data.linear_connected && (
            <div className="text-[8px] font-mono px-2 py-1 rounded mb-2" style={{ color: 'var(--ab-muted)', background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}>
              Linear not connected — showing internal projects only
            </div>
          )}

          {/* Project list */}
          <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
            {data.by_project.length === 0 && (
              <p className="text-[10px] font-mono py-4 text-center" style={{ color: 'var(--ab-muted)' }}>No active projects</p>
            )}
            {data.by_project.map(p => {
              const isStale = data.stale_note.includes(p.name);
              const isOverdue = p.deadline && new Date(p.deadline) < new Date();
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded"
                  style={{ background: isStale ? 'rgba(220,38,38,0.04)' : 'transparent' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: isStale ? 'var(--ab-red)' : isOverdue ? 'var(--ab-gold)' : 'var(--ab-green)' }}
                  />
                  <span className="text-[11px] font-mono flex-1 truncate" style={{ color: 'var(--ab-text)' }}>{p.name}</span>
                  <span className="text-[9px] font-mono shrink-0" style={{ color: 'var(--ab-muted)' }}>{p.client}</span>
                  {isStale && <span className="text-[8px] font-mono shrink-0" style={{ color: 'var(--ab-red)' }}>STALE</span>}
                  {isOverdue && !isStale && <span className="text-[8px] font-mono shrink-0" style={{ color: 'var(--ab-gold)' }}>OVERDUE</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center py-2 rounded" style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}>
      <span className="text-xl font-mono font-black tabular-nums leading-none" style={{ color }}>{value}</span>
      <span className="text-[8px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--ab-muted)' }}>{label}</span>
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
