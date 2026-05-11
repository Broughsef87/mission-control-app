"use client";

import React from 'react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface PrepData {
  meetingId: string;
  deliverables: { title: string; completedAt: string; url?: string }[];
  outstandingAsks: { label: string; channel?: string }[];
  openThreads: { subject: string; from?: string }[];
  error?: string;
}

export default function PrepPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = React.use(params);
  const { data, isLoading, error } = useSWR<PrepData>(
    `/api/morning-desk/prep/${meetingId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '10px', color: 'var(--ab-muted)', textDecoration: 'none' }}>
          ← Morning Desk
        </Link>
        <h1 className="forge-heading" style={{ fontSize: '1.1rem', marginTop: '0.75rem' }}>
          Meeting <span style={{ color: 'var(--ab-gold)' }}>Prep</span>
        </h1>
        <p style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', color: 'var(--ab-muted)', marginTop: '0.25rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {meetingId}
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
          ))}
        </div>
      )}

      {error && (
        <p style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '10px', color: 'var(--ab-red)' }}>
          Failed to load prep data.
        </p>
      )}

      {data && (
        <div className="flex flex-col gap-4">
          {/* Recent Deliverables */}
          <PrepSection label="Recent Deliverables (7d)" accent="var(--ab-green)">
            {data.deliverables.length === 0 ? (
              <EmptyState label="No completed Linear issues in the last 7 days" />
            ) : (
              data.deliverables.map((d, i) => (
                <PrepRow
                  key={i}
                  label={d.title}
                  sub={formatDistanceToNow(new Date(d.completedAt), { addSuffix: true })}
                  href={d.url}
                  accent="var(--ab-green)"
                />
              ))
            )}
          </PrepSection>

          {/* Outstanding Asks */}
          <PrepSection label="Outstanding Asks" accent="var(--ab-gold)">
            {data.outstandingAsks.length === 0 ? (
              <EmptyState label="Slack integration not configured" muted />
            ) : (
              data.outstandingAsks.map((a, i) => (
                <PrepRow key={i} label={a.label} sub={a.channel ?? 'Slack'} accent="var(--ab-gold)" />
              ))
            )}
          </PrepSection>

          {/* Open Threads */}
          <PrepSection label="Open Email Threads" accent="var(--ab-muted)">
            {data.openThreads.length === 0 ? (
              <EmptyState label="Gmail integration not configured" muted />
            ) : (
              data.openThreads.map((t, i) => (
                <PrepRow key={i} label={t.subject} sub={t.from ?? ''} accent="var(--ab-muted)" />
              ))
            )}
          </PrepSection>
        </div>
      )}
    </div>
  );
}

function PrepSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--ab-border)' }}>
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
        <span className="text-[8px] font-mono tracking-[0.2em] uppercase" style={{ color: 'var(--ab-muted)' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function PrepRow({ label, sub, href, accent }: { label: string; sub: string; href?: string; accent: string }) {
  const inner = (
    <div
      className="flex items-start gap-2 px-3 py-2 rounded"
      style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}
    >
      <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: accent }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono leading-snug" style={{ color: 'var(--ab-text)' }}>{label}</p>
        <p className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>{sub}</p>
      </div>
      {href && <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--ab-muted)' }}>↗</span>}
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>;
  return inner;
}

function EmptyState({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <p className="text-[9px] font-mono px-2 py-1" style={{ color: muted ? 'var(--ab-border-bright)' : 'var(--ab-muted)' }}>
      {label}
    </p>
  );
}
