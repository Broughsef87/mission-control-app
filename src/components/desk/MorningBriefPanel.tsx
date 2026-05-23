"use client";

import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';

import ReactMarkdown from 'react-markdown';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 2 * 60 * 1000;

interface Briefing {
  id: string;
  content: string;
  title?: string;
  type?: string;
  created_at: string;
}

export default function MorningBriefPanel() {
  const { data, isValidating } = useSWR<Briefing[]>(
    '/api/briefing',
    fetcher,
    { refreshInterval: REFRESH, refreshWhenHidden: true, revalidateOnFocus: true }
  );

  return (
    <div className="forge-panel flex flex-col gap-0 h-full" style={{ borderLeft: '2px solid var(--ab-gold)' }}>
      <PanelHeader label="Morning Brief Feed" cadence="on post" validating={isValidating} asOf={data?.[0]?.created_at} />

      {!data && (
        <div className="flex flex-col gap-2 mt-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3.5 rounded animate-pulse" style={{ background: 'var(--ab-border)', width: `${50 + i * 12}%` }} />
          ))}
        </div>
      )}

      {data && data.length > 0 && (
        <div className="flex-1 overflow-y-auto mt-3 flex flex-col gap-4">
          {data.map((brief, idx) => (
            <div key={brief.id} style={{ paddingBottom: '1rem', borderBottom: idx === data.length - 1 ? 'none' : '1px solid var(--ab-border)' }}>
              {brief.title ? (
                <div className="forge-label mb-2 flex justify-between items-center">
                  <span>{brief.title}</span>
                  <span style={{ fontSize: '8px', color: 'var(--ab-muted)', textTransform: 'uppercase' }}>{formatDistanceToNow(new Date(brief.created_at), { addSuffix: true })}</span>
                </div>
              ) : (
                <div className="flex justify-end mb-1">
                  <span style={{ fontSize: '8px', color: 'var(--ab-muted)', fontFamily: 'var(--ab-font-mono)', textTransform: 'uppercase' }}>{formatDistanceToNow(new Date(brief.created_at), { addSuffix: true })}</span>
                </div>
              )}
              <div className="text-sm font-sans leading-relaxed" style={{ color: 'var(--ab-body-text)' }}>
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold" style={{ color: 'var(--ab-text)' }} {...props} />,
                    a: ({node, ...props}) => <a className="underline" style={{ color: 'var(--ab-gold)' }} {...props} />,
                  }}
                >
                  {brief.content.replace(/\\n/g, '\n')}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-[10px] font-mono mt-3" style={{ color: 'var(--ab-muted)' }}>
          No briefs yet. Devroux posts each morning.
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
