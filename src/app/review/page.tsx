"use client";

import useSWR from 'swr';
import { format, parseISO } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface ReviewMeta {
  filename: string;
  date: string;
  title: string;
  snippet: string;
  blockers: string[];
}

interface ReviewsData {
  configured: boolean;
  reviews: ReviewMeta[];
  message?: string;
}

export default function ReviewPage() {
  const { data, isLoading } = useSWR<ReviewsData>('/api/reviews', fetcher, {
    revalidateOnFocus: false,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--ab-border)' }}>
        <h1 className="forge-heading" style={{ fontSize: '1.25rem' }}>
          Weekly <span style={{ color: 'var(--ab-gold)' }}>Review</span>
        </h1>
        <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ab-border-bright)' }}>
          last 12 weeks
        </span>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded animate-pulse" style={{ background: 'var(--ab-border)' }} />
          ))}
        </div>
      )}

      {data && !data.configured && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-10">
          <p className="text-[10px] font-mono" style={{ color: 'var(--ab-muted)' }}>Reviews not configured</p>
          <p className="text-[9px] font-mono text-center px-4 leading-relaxed" style={{ color: 'var(--ab-border-bright)' }}>
            Set the <code style={{ color: 'var(--ab-gold)' }}>REVIEWS_DIR</code> environment variable to your weekly review folder.
          </p>
        </div>
      )}

      {data?.configured && data.reviews.length === 0 && (
        <div className="flex items-center justify-center flex-1 py-10">
          <p className="text-[10px] font-mono" style={{ color: 'var(--ab-muted)' }}>No review files found</p>
        </div>
      )}

      {data?.configured && data.reviews.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.reviews.map((rev) => (
            <ReviewCard key={rev.filename} review={rev} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewMeta }) {
  const dateLabel = review.date
    ? format(parseISO(review.date), 'MMM d, yyyy')
    : review.filename.replace(/\.md$/, '');

  return (
    <div
      className="flex flex-col gap-2 px-3 py-2.5 rounded"
      style={{ background: 'var(--ab-surface-2)', border: '1px solid var(--ab-border)' }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--ab-text)' }}>{review.title}</span>
        <span className="text-[8px] font-mono shrink-0" style={{ color: 'var(--ab-muted)' }}>{dateLabel}</span>
      </div>

      {review.snippet && (
        <p className="text-[9px] font-mono leading-relaxed" style={{ color: 'var(--ab-muted)' }}>
          {review.snippet}
        </p>
      )}

      {review.blockers.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[7px] font-mono tracking-[0.2em] uppercase" style={{ color: 'var(--ab-red)' }}>Blockers</span>
          {review.blockers.map((b, i) => (
            <p key={i} className="text-[9px] font-mono" style={{ color: 'var(--ab-muted)' }}>
              — {b}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
