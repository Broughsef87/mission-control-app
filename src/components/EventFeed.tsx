"use client";

import React, { useEffect, useState } from 'react';
import { Sun, Moon, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getSupabaseClient } from '@/lib/supabase';

type EventType = 'morning_brief' | 'weekly_review' | 'evening_checkin' | 'checkin';

interface FeedEvent {
  id: string;
  type: EventType;
  title: string;
  content: string;
  created_at: string;
  source?: string;
}

const typeConfig: Record<EventType, { icon: React.ComponentType<any>; label: string; chipClass: string }> = {
  morning_brief:   { icon: Sun,       label: 'Morning Brief',   chipClass: 'chip chip-auto' },
  weekly_review:   { icon: BarChart2, label: 'Weekly Review',   chipClass: 'chip chip-sched' },
  evening_checkin: { icon: Moon,      label: 'Check-in',        chipClass: 'chip chip-build' },
  checkin:         { icon: Moon,      label: 'Check-in',        chipClass: 'chip chip-build' },
};

function EventCard({ event }: { event: FeedEvent }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[event.type] ?? typeConfig.morning_brief;
  const Icon = cfg.icon;
  const preview = event.content?.slice(0, 200) ?? '';
  const hasMore = (event.content?.length ?? 0) > 200;

  return (
    <div className="artifact-panel mb-3">
      <div className="artifact-header">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ strokeWidth: 1.5 }} />
        <span className={cfg.chipClass}>{cfg.label}</span>
        <span className="flex-1 truncate">{event.title || format(new Date(event.created_at), 'MMM d, yyyy')}</span>
        <span className="ml-auto text-ab-muted shrink-0">
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
        </span>
      </div>
      <div className="artifact-body text-ab-body-text">
        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
          {expanded ? event.content : preview}
          {!expanded && hasMore ? '…' : ''}
        </pre>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ab-muted hover:text-ab-body transition-colors"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Collapse</> : <><ChevronDown className="w-3 h-3" /> Expand</>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function EventFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | EventType>('all');

  async function load() {
    const data = await fetch('/api/feed').then(r => r.json()).catch(() => []);
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const sb = getSupabaseClient();
    const channel = sb
      .channel('event-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_briefings' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => load())
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  const filterOptions: { label: string; value: 'all' | EventType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Briefs', value: 'morning_brief' },
    { label: 'Check-ins', value: 'checkin' },
    { label: 'Reviews', value: 'weekly_review' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="ab-overline">Live Feed</span>
        <div className="flex items-center gap-1">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm border transition-colors ${
                filter === opt.value
                  ? 'border-ab-red text-ab-red bg-ab-red/8'
                  : 'border-ab-border text-ab-muted hover:border-ab-border-bright hover:text-ab-body'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="artifact-panel h-24 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="artifact-panel">
          <div className="artifact-body text-ab-muted text-[11px]">
            No events yet. Cron feeds will appear here after they fire.
          </div>
        </div>
      )}

      {!loading && filtered.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
