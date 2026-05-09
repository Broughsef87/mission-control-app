"use client";

import MoneyPanel from '@/components/desk/MoneyPanel';
import CalendarPanel from '@/components/desk/CalendarPanel';
import WorkStatusPanel from '@/components/desk/WorkStatusPanel';
import InboxPanel from '@/components/desk/InboxPanel';
import AgentLogPanel from '@/components/desk/AgentLogPanel';
import MorningBriefPanel from '@/components/desk/MorningBriefPanel';
import { format } from 'date-fns';

export default function MorningDesk() {
  const dateLabel = format(new Date(), "EEEE, MMMM d · yyyy");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0, paddingBottom: '0.5rem', borderBottom: '1px solid var(--ab-border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <h1 className="forge-heading" style={{ fontSize: '1.25rem' }}>
            Morning <span style={{ color: 'var(--ab-gold)' }}>Desk</span>
          </h1>
          <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ab-muted)' }}>
            {dateLabel}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--ab-font-mono)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ab-border-bright)' }}>
          autorefresh · no interaction needed
        </span>
      </div>

      {/* 6-panel grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gridTemplateRows: 'auto auto auto',
        gridTemplateAreas: `
          "money    calendar"
          "work     inbox"
          "agentlog brief"
        `,
        gap: '0.75rem',
        minHeight: 0,
      }}>
        <div style={{ gridArea: 'money' }}>
          <MoneyPanel />
        </div>
        <div style={{ gridArea: 'calendar' }}>
          <CalendarPanel />
        </div>
        <div style={{ gridArea: 'work' }}>
          <WorkStatusPanel />
        </div>
        <div style={{ gridArea: 'inbox' }}>
          <InboxPanel />
        </div>
        <div style={{ gridArea: 'agentlog' }}>
          <AgentLogPanel />
        </div>
        <div style={{ gridArea: 'brief' }}>
          <MorningBriefPanel />
        </div>
      </div>

    </div>
  );
}
