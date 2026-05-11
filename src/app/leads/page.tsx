"use client";

import { format, subDays } from 'date-fns';

// Mock data — replaced by intake backend once FOR-40 ships
const MOCK_LEADS = [
  {
    id: 'l1',
    name: 'Marcus Webb',
    company: 'PinPoint Logistics',
    title: 'VP of Operations',
    companySize: '51-200',
    industry: 'Transportation & Logistics',
    compassScore: 91,
    lastTouch: subDays(new Date(), 1),
    nextAction: 'Send Forge OS demo link — high intent signal from email click',
    source: 'Apollo',
  },
  {
    id: 'l2',
    name: 'Priya Nair',
    company: 'Luminate Health',
    title: 'Chief of Staff',
    companySize: '201-500',
    industry: 'Healthcare SaaS',
    compassScore: 78,
    lastTouch: subDays(new Date(), 2),
    nextAction: 'Follow up on proposal — went quiet after pricing call',
    source: 'Inbound',
  },
  {
    id: 'l3',
    name: 'Derek Halsted',
    company: 'Ironclad Capital',
    title: 'Managing Partner',
    companySize: '11-50',
    industry: 'Private Equity',
    compassScore: 65,
    lastTouch: subDays(new Date(), 5),
    nextAction: 'Share ROI Self Storage case study — relevant vertical',
    source: 'Apollo',
  },
  {
    id: 'l4',
    name: 'Alicia Torres',
    company: 'Redwood Construction',
    title: 'Director of Operations',
    companySize: '51-200',
    industry: 'Construction',
    compassScore: 82,
    lastTouch: subDays(new Date(), 3),
    nextAction: 'Schedule discovery call — confirmed budget availability',
    source: 'Referral',
  },
  {
    id: 'l5',
    name: 'James Okafor',
    company: 'NovaSpark Media',
    title: 'CEO',
    companySize: '1-10',
    industry: 'Digital Media',
    compassScore: 44,
    lastTouch: subDays(new Date(), 9),
    nextAction: 'Nurture — not ready yet; check back in 30 days',
    source: 'Apollo',
  },
  {
    id: 'l6',
    name: 'Sandra Kim',
    company: 'Meridian Real Estate',
    title: 'Head of Biz Dev',
    companySize: '11-50',
    industry: 'Real Estate',
    compassScore: 73,
    lastTouch: subDays(new Date(), 4),
    nextAction: 'Connect with decision-maker — Sandra is a champion, not the buyer',
    source: 'Inbound',
  },
];

function heatColor(score: number) {
  if (score >= 80) return 'var(--ab-red)';
  if (score >= 60) return 'var(--ab-gold)';
  return 'var(--ab-muted)';
}

function heatLabel(score: number) {
  if (score >= 80) return 'HOT';
  if (score >= 60) return 'WARM';
  return 'COOL';
}

function CompassBadge({ score }: { score: number }) {
  const color = heatColor(score);
  return (
    <div className="flex flex-col items-center shrink-0" style={{ minWidth: 44 }}>
      <span
        className="text-[18px] font-mono font-black tabular-nums leading-none"
        style={{ color }}
      >
        {score}
      </span>
      <span className="text-[6px] font-mono font-bold tracking-[0.2em]" style={{ color }}>
        {heatLabel(score)}
      </span>
    </div>
  );
}

export default function LeadsPage() {
  const sorted = [...MOCK_LEADS].sort((a, b) => b.compassScore - a.compassScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--ab-border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <h1 className="forge-heading" style={{ fontSize: '1.25rem' }}>
            Lead <span style={{ color: 'var(--ab-gold)' }}>Pipeline</span>
          </h1>
          <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ab-muted)' }}>
            {sorted.length} active · FOR-40 pending
          </span>
        </div>
        <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ab-border-bright)' }}>
          mock data
        </span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 1fr 120px', gap: '0 1rem', padding: '0 0.75rem', flexShrink: 0 }}>
        {['Score', 'Contact', 'Apollo', 'Last Touch'].map(h => (
          <span key={h} style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ab-muted)' }}>{h}</span>
        ))}
      </div>

      {/* Lead rows */}
      <div className="flex flex-col gap-2 flex-1">
        {sorted.map((lead) => (
          <div
            key={lead.id}
            className="rounded px-3 py-3"
            style={{
              background: 'var(--ab-surface-2)',
              border: `1px solid ${lead.compassScore >= 80 ? `rgba(220,38,38,0.25)` : 'var(--ab-border)'}`,
              display: 'grid',
              gridTemplateColumns: '44px 1fr 1fr 120px',
              gap: '0 1rem',
              alignItems: 'start',
            }}
          >
            {/* Compass score */}
            <CompassBadge score={lead.compassScore} />

            {/* Contact */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-semibold" style={{ color: 'var(--ab-text)' }}>{lead.name}</span>
                <span
                  className="text-[7px] font-mono px-1 py-0.5 rounded uppercase"
                  style={{ color: 'var(--ab-muted)', border: '1px solid var(--ab-border)' }}
                >
                  {lead.source}
                </span>
              </div>
              <div className="text-[9px] font-mono truncate" style={{ color: 'var(--ab-muted)' }}>{lead.company}</div>
              <div className="mt-1.5 text-[8px] font-mono leading-snug" style={{ color: 'var(--ab-border-bright)' }}>
                → {lead.nextAction}
              </div>
            </div>

            {/* Apollo enrichment */}
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-[9px] font-mono" style={{ color: 'var(--ab-text)' }}>{lead.title}</span>
              <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>{lead.companySize} employees</span>
              <span className="text-[8px] font-mono truncate" style={{ color: 'var(--ab-muted)' }}>{lead.industry}</span>
            </div>

            {/* Last touch */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono tabular-nums" style={{ color: 'var(--ab-text)' }}>
                {format(lead.lastTouch, 'MMM d')}
              </span>
              <span className="text-[8px] font-mono" style={{ color: 'var(--ab-muted)' }}>
                {Math.round((Date.now() - lead.lastTouch.getTime()) / 86400000)}d ago
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
