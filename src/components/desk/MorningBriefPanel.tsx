"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 10 * 60 * 1000;

interface Briefing {
  id: string;
  content: string;
  title?: string;
  type?: string;
  created_at: string;
}

export default function MorningBriefPanel() {
  const { data, isValidating } = useSWR<Briefing>(
    '/api/briefing',
    fetcher,
    { refreshInterval: REFRESH, revalidateOnFocus: false }
  );

  return (
    <div className="forge-panel flex flex-col gap-0 h-full" style={{ borderLeft: '2px solid var(--ab-gold)' }}>
      <PanelHeader label="Morning Brief" cadence="on post" validating={isValidating} asOf={data?.created_at} />

      {!data && (
        <div className="flex flex-col gap-2 mt-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3.5 rounded animate-pulse" style={{ background: 'var(--ab-border)', width: `${50 + i * 12}%` }} />
          ))}
        </div>
      )}

      {data && (
        <div className="flex-1 overflow-y-auto mt-3">
          {data.title && (
            <div className="forge-label mb-2">{data.title}</div>
          )}
          <p className="text-sm font-sans italic leading-relaxed" style={{ color: 'var(--ab-body-text)' }}>
            &ldquo;{data.content}&rdquo;
          </p>
        </div>
      )}

      {!data && (
        <p className="text-[10px] font-mono mt-3" style={{ color: 'var(--ab-muted)' }}>
          No brief yet. Devroux posts each morning.
        </p>
      )}
    </div>
  );
}

function PanelHeader({ label, cadence, validating, asOf }: { label: string; cadence: string; validating: boolean; asOf?: string }) {
  return (
    <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
      <div className="flex items-center gap-2">
        <span className="forge-label">{label}</span>
        <span className="text-[8px] font-mono" style={{ color: 'var(--ab-gold)' }}>by Devroux</span>
      </div>
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
