"use client";

import useSWR from 'swr';
import { format } from 'date-fns';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());
const REFRESH = 60 * 1000;

interface CalEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  attendees?: string[];
  source?: 'personal' | 'workspace';
}

interface CalData {
  configured: boolean;
  personal_connected?: boolean;
  workspace_connected?: boolean;
  events: CalEvent[];
  message?: string;
  as_of?: string;
}

export default function CalendarPanel() {
  const { data, isValidating } = useSWR<CalData>(
    '/api/morning-desk/calendar',
    fetcher,
    { refreshInterval: REFRESH, revalidateOnFocus: false }
  );

  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="forge-panel flex flex-col gap-0 h-full">
      <PanelHeader label="Today's Calendar" cadence="1m" validating={isValidating} />

      <div className="flex items-center justify-between mt-2 mb-2">
        <span className="text-[10px] font-mono" style={{ color: 'var(--ab-muted)' }}>{todayLabel}</span>
        {data?.configured && (
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{
              color: data.personal_connected ? 'var(--ab-green)' : 'var(--ab-muted)',
              border: `1px solid ${data.personal_connected ? 'rgba(40,205,65,0.3)' : 'var(--ab-border)'}`,
            }}>personal</span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{
              color: data.workspace_connected ? 'var(--ab-green)' : 'var(--ab-muted)',
              border: `1px solid ${data.workspace_connected ? 'rgba(40,205,65,0.3)' : 'var(--ab-border)'}`,
            }}>workspace</span>
          </div>
        )}
      </div>

      {!data && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
          ))}
        </div>
      )}

      {data && !data.configured && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-6">
          <p className="text-[10px] font-mono text-center" style={{ color: 'var(--ab-muted)' }}>
            Google Calendar not connected
          </p>
          <p className="text-[9px] font-mono text-center px-4 leading-relaxed" style={{ color: 'var(--ab-border-bright)' }}>
            {data.message}
          </p>
        </div>
      )}

      {data?.configured && data.events.length === 0 && (
        <div className="flex items-center justify-center flex-1 py-6">
          <p className="text-[10px] font-mono" style={{ color: 'var(--ab-muted)' }}>No events today</p>
        </div>
      )}

      {data?.configured && data.events.length > 0 && (
        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
          {data.events.map(ev => (
            <CalEventRow key={ev.id} event={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

function CalEventRow({ event }: { event: CalEvent }) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const now = new Date();
  const isNow = start <= now && end >= now;
  const isPast = end < now;

  return (
    <div
      className="flex gap-3 items-start px-2 py-1.5 rounded"
      style={{
        background: isNow ? 'rgba(232,163,32,0.06)' : 'transparent',
        borderLeft: `2px solid ${isNow ? 'var(--ab-gold)' : isPast ? 'var(--ab-border)' : 'var(--ab-border-bright)'}`,
        opacity: isPast ? 0.45 : 1,
      }}
    >
      <div className="shrink-0 text-right" style={{ minWidth: 36 }}>
        <div className="text-[10px] font-mono font-bold tabular-nums" style={{ color: isNow ? 'var(--ab-gold)' : 'var(--ab-text)' }}>
          {format(start, 'h:mm')}
        </div>
        <div className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>
          {format(start, 'a')}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-semibold truncate" style={{ color: 'var(--ab-text)' }}>{event.summary}</span>
          {event.source && (
            <span className="text-[7px] font-mono shrink-0" style={{ color: 'var(--ab-muted)' }}>{event.source === 'personal' ? '·p' : '·w'}</span>
          )}
        </div>
        {event.attendees && event.attendees.length > 0 && (
          <div className="text-[9px] font-mono truncate" style={{ color: 'var(--ab-muted)' }}>
            {event.attendees.slice(0, 3).join(', ')}{event.attendees.length > 3 ? ` +${event.attendees.length - 3}` : ''}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        {isNow && <span className="text-[8px] font-mono font-bold" style={{ color: 'var(--ab-gold)' }}>NOW</span>}
        {(event.attendees?.length ?? 0) > 1 && (
          <Link href={`/prep/${event.id}`} className="text-[8px] font-mono" style={{ color: 'var(--ab-gold)', opacity: 0.7, textDecoration: 'none' }}>
            Prep →
          </Link>
        )}
      </div>
    </div>
  );
}

function PanelHeader({ label, cadence, validating }: { label: string; cadence: string; validating: boolean }) {
  return (
    <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--ab-border)' }}>
      <span className="forge-label">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ color: 'var(--ab-muted)', border: '1px solid var(--ab-border)' }}>{cadence}</span>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: validating ? 'var(--ab-gold)' : 'var(--ab-green)', animation: validating ? 'pulse-glow 1s ease-in-out infinite' : undefined }} />
      </div>
    </div>
  );
}
