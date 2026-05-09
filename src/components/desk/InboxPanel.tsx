"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 5 * 60 * 1000;

interface InboxItem {
  id: string;
  type: 'approval' | 'lead' | 'client_reply' | 'handoff';
  label: string;
  source: string;
  created_at: string;
  urgency: 'high' | 'medium' | 'low';
}

interface InboxData {
  configured: boolean;
  lead_intake_live: boolean;
  items: InboxItem[];
  total: number;
  note?: string;
  as_of: string;
}

const urgencyColor: Record<string, string> = {
  high: 'var(--ab-red)',
  medium: 'var(--ab-gold)',
  low: 'var(--ab-muted)',
};

const typeLabel: Record<string, string> = {
  approval: 'APPR',
  lead: 'LEAD',
  client_reply: 'CLIENT',
  handoff: 'HNDOF',
};

export default function InboxPanel() {
  const { data, isValidating } = useSWR<InboxData>(
    '/api/morning-desk/inbox',
    fetcher,
    { refreshInterval: REFRESH, revalidateOnFocus: false }
  );

  const hasItems = data && data.total > 0;

  return (
    <div className="forge-panel flex flex-col gap-0 h-full" style={{ borderColor: hasItems ? 'rgba(232,163,32,0.3)' : undefined }}>
      <PanelHeader label="Inbox" cadence="5m" validating={isValidating} count={data?.total} asOf={data?.as_of} />

      {!data && (
        <div className="flex flex-col gap-2 mt-3">
          {[1, 2].map(i => (
            <div key={i} className="h-10 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-6">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ab-green)', boxShadow: '0 0 6px var(--ab-green)' }} />
          <p className="text-[10px] font-mono" style={{ color: 'var(--ab-muted)' }}>All clear</p>
          {data.note && !data.lead_intake_live && (
            <p className="text-[8px] font-mono text-center px-3" style={{ color: 'var(--ab-border-bright)' }}>
              FOR-40 pending — leads will appear here
            </p>
          )}
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="flex flex-col gap-1 mt-2 overflow-y-auto flex-1">
          {data.items.map(item => (
            <div
              key={item.id}
              className="flex items-start gap-2 px-2 py-2 rounded"
              style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: urgencyColor[item.urgency] }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono font-semibold truncate" style={{ color: 'var(--ab-text)' }}>{item.label}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] font-mono font-bold" style={{ color: urgencyColor[item.urgency] }}>
                    {typeLabel[item.type] ?? item.type.toUpperCase()}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>{item.source}</span>
                  <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PanelHeader({ label, cadence, validating, count, asOf }: { label: string; cadence: string; validating: boolean; count?: number; asOf?: string }) {
  return (
    <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
      <div className="flex items-center gap-2">
        <span className="forge-label">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--ab-gold)', color: 'var(--ab-base)' }}>{count}</span>
        )}
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
