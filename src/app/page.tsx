import { getProjects, getPendingApprovals, getRevenueMTD, getCheckinByDate, getCheckinsMTD } from '@/lib/db';
import { parseCheckinContent } from '@/lib/parseCheckin';
import { getCronHealth } from '@/lib/cronHealth';
import ApprovalsPanel from '@/components/ApprovalsPanel';
import AlertBanner from '@/components/AlertBanner';
import EventFeed from '@/components/EventFeed';
import LiveAgentFeed from '@/components/LiveAgentFeed';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

// Build a Checkin-shaped object from a Supabase row
function rowToCheckin(row: any, date: string) {
  if (row?.content) return parseCheckinContent(row.content, date);
  if (!row) return null;
  return {
    date,
    found: true,
    format: 'supabase' as const,
    priorities: row.priorities ?? [],
    blocker: row.blocker ?? '',
    notes: row.notes ? [row.notes] : [],
    kpi: Object.entries(row.numbers ?? {}).map(([key, value]) => ({ key, value: String(value) })),
    completed: [] as string[],
    wins: [] as string[],
    decisions: [] as string[],
    revenueNote: '',
    commitments: [] as string[],
  };
}

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yd = yesterday.toISOString().split('T')[0];

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const [projects, revenueMTD, approvals, todayRow, yesterdayRow, checkinsMTD] = await Promise.all([
    getProjects().catch(() => []),
    getRevenueMTD().catch(() => ({ total: 0, byCategory: {} })),
    getPendingApprovals().catch(() => []),
    getCheckinByDate(today).catch(() => null),
    getCheckinByDate(yd).catch(() => null),
    getCheckinsMTD().catch(() => []),
  ]);

  // Sum MTD KPIs from check-in numbers across all days this month
  function sumKey(rows: any[], ...matchers: string[]): number {
    return rows.reduce((total, row) => {
      const nums = row.numbers ?? {};
      for (const [k, v] of Object.entries(nums)) {
        const kl = k.toLowerCase();
        if (matchers.some(m => kl.includes(m))) {
          const n = parseFloat(String(v));
          if (!isNaN(n)) total += n;
        }
      }
      return total;
    }, 0);
  }
  const contentPostsMTD   = sumKey(checkinsMTD, 'content', 'post');
  const outreachMTD       = sumKey(checkinsMTD, 'outreach', 'contact');
  const revenueConvosMTD  = sumKey(checkinsMTD, 'revenue conv', 'convo', 'revenue conversation');

  const cronJobs = getCronHealth();

  const todayCheckin = rowToCheckin(todayRow, today);
  const fallbackCheckin = rowToCheckin(yesterdayRow, yd);
  const usingFallback = !todayCheckin && !!fallbackCheckin;
  const fallbackDate = yd;
  const checkin = todayCheckin ?? fallbackCheckin ?? {
    date: today, found: false, format: 'unknown' as const,
    priorities: [], blocker: '', notes: [], kpi: [],
    completed: [], wins: [], decisions: [], revenueNote: '', commitments: [],
  };
  (checkin as any).found = !!(todayCheckin || fallbackCheckin);

  const inProgressProjects = (projects as any[]).filter(p => p.status === 'In Progress');
  const missingCheckin = !checkin.found;
  const needsAttentionCount = (approvals as any[]).length + (missingCheckin ? 1 : 0);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">

      {/* ── Alert Banner ───────────────────────────────────────── */}
      <AlertBanner />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-4xl sm:text-5xl mb-1">
            The <span className="text-brand-gold">Foundry</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.25em]">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {checkin.found && !usingFallback ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-ab-green uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-ab-green inline-block" />
              Check-in found
            </span>
          ) : usingFallback ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-ab-gold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-ab-gold inline-block" />
              Using {fallbackDate} priorities
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-ab-gold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-ab-gold animate-pulse inline-block" />
              No check-in today
            </span>
          )}
          {(approvals as any[]).length > 0 && (
            <span className="flex items-center gap-1.5 bg-brand-gold text-ab-body text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              {(approvals as any[]).length} approval{(approvals as any[]).length !== 1 ? 's' : ''} pending
            </span>
          )}
        </div>
      </header>

      {/* ── KPI STRIP ──────────────────────────────────────────── */}
      <section>
        <div className="forge-label mb-3">Month to Date</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Revenue MTD',    value: `$${(revenueMTD as any).total.toLocaleString()}`, sub: 'Goal: $1M/yr',       color: 'text-brand-gold' },
            { label: 'Content Posts',  value: contentPostsMTD  || '—',                          sub: 'Posts this month',  color: 'text-brand-ink'  },
            { label: 'Outreach',       value: outreachMTD      || '—',                          sub: 'Contacts this month', color: 'text-brand-ink' },
            { label: 'Rev. Convos',    value: revenueConvosMTD || '—',                          sub: 'Conversations MTD', color: 'text-brand-ink'  },
          ].map(kpi => (
            <div key={kpi.label} className="forge-card rounded-2xl p-4">
              <div className="forge-label mb-1">{kpi.label}</div>
              <div className={`text-2xl font-black font-mono tabular-nums ${kpi.color}`}>{String(kpi.value)}</div>
              <div className="text-[9px] font-mono text-brand-medium-gray uppercase mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TODAY ──────────────────────────────────────────────── */}
      <section>
        <div className="forge-label mb-4">Today</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Priorities + Blocker */}
          <div className="forge-panel">
            <div className="flex items-center justify-between mb-3">
              <div className="forge-label">
                {usingFallback ? `From ${fallbackDate} — First Move` : "This Session's Focus"}
              </div>
              {usingFallback && (
                <span className="text-[8px] font-mono text-ab-gold uppercase tracking-widest">No check-in today</span>
              )}
            </div>

            {checkin.found && checkin.priorities.length > 0 ? (
              <ol className="space-y-2.5">
                {checkin.priorities.map((p: string, i: number) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-[10px] font-mono font-bold text-brand-gold shrink-0 w-4 pt-0.5">{i + 1}.</span>
                    <span className="text-sm text-brand-ink leading-snug">{p}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-brand-medium-gray italic">
                No priorities found. Create{' '}
                <code className="text-[10px] bg-brand-warm-gray px-1 py-0.5 rounded">
                  workspace/memory/checkins/{today}.md
                </code>
              </p>
            )}

            {checkin.blocker && (
              <div className="mt-4 pt-4 border-t border-brand-warm-gray">
                <div className="forge-label mb-1 text-ab-red">Blocker</div>
                <p className="text-xs text-brand-slate italic">{checkin.blocker}</p>
              </div>
            )}
          </div>

          {/* KPI Snapshot */}
          <div className="forge-panel">
            <div className="forge-label mb-3">KPI Snapshot</div>

            {checkin.found && checkin.kpi.length > 0 ? (
              <div className="space-y-2">
                {checkin.kpi.map((item, i) => (
                  <div key={i} className="flex justify-between items-start py-0.5 gap-3">
                    <span className="text-[11px] font-mono text-brand-slate">{item.key}</span>
                    <span className="text-[11px] font-mono font-bold tabular-nums text-brand-ink text-right shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-[11px] font-mono text-brand-medium-gray">
                <div className="flex justify-between"><span>Content posts</span><span>—</span></div>
                <div className="flex justify-between"><span>Outreach contacts</span><span>—</span></div>
                <div className="flex justify-between"><span>Revenue conversations</span><span>—</span></div>
                <p className="text-[10px] italic pt-1">Add a Numbers section to your check-in to populate this.</p>
              </div>
            )}

            {checkin.revenueNote && (
              <div className="mt-4 pt-4 border-t border-brand-warm-gray">
                <div className="forge-label mb-1 text-brand-gold">Revenue Note</div>
                <p className="text-xs text-brand-slate italic">{checkin.revenueNote}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── NEEDS ATTENTION ────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="forge-label">Needs Attention</div>
          {needsAttentionCount === 0 && (
            <span className="text-[9px] font-mono text-ab-green font-bold uppercase tracking-widest">— All clear</span>
          )}
        </div>

        {missingCheckin && (
          <div className="forge-panel mb-4" style={{ borderColor: 'var(--color-amber)', backgroundColor: 'var(--color-amber-bg)' }}>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ab-gold shrink-0 mt-1.5" />
              <div>
                <div className="text-xs font-bold text-ab-gold mb-0.5">No daily check-in for {today}</div>
                <p className="text-[11px] text-ab-gold italic">
                  Create <code className="bg-ab-gold px-1 py-0.5 rounded text-[10px]">workspace/memory/checkins/{today}.md</code>{' '}
                  to populate priorities, KPIs, and blockers.
                </p>
              </div>
            </div>
          </div>
        )}

        <ApprovalsPanel />
      </section>

      {/* ── TWO-PANE: FEED + AGENT ACTIVITY ───────────────────── */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left pane — Event Feed (60%) */}
          <div className="lg:col-span-3">
            <EventFeed />
          </div>

          {/* Right pane — Live Agent Feed + Cron Health (40%) */}
          <div className="lg:col-span-2 space-y-6">
            <LiveAgentFeed />

            {/* Cron health compact */}
            {cronJobs.length > 0 && (
              <div className="forge-panel !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-warm-gray">
                  <span className="forge-label">Cron Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-ab-green font-bold">{cronJobs.filter(j => j.stalenessStatus === 'ok').length} ok</span>
                    {cronJobs.filter(j => j.stalenessStatus !== 'ok' && j.stalenessStatus !== 'disabled').length > 0 && (
                      <span className="text-[8px] font-mono text-ab-red font-bold">
                        {cronJobs.filter(j => j.stalenessStatus !== 'ok' && j.stalenessStatus !== 'disabled').length} issue
                      </span>
                    )}
                  </div>
                </div>
                {cronJobs.slice(0, 8).map((job) => {
                  const dot =
                    job.stalenessStatus === 'ok'       ? 'bg-ab-green' :
                    job.stalenessStatus === 'stale'    ? 'bg-ab-gold' :
                    job.stalenessStatus === 'critical' ? 'bg-ab-red animate-pulse' :
                    job.stalenessStatus === 'never'    ? 'bg-ab-gold' :
                                                         'bg-brand-warm-gray';
                  return (
                    <div key={job.id} className="flex items-center gap-3 px-4 py-2 border-b border-brand-warm-gray last:border-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                      <span className="text-[10px] font-mono text-brand-ink flex-1 truncate">{job.name}</span>
                      {job.lastRunAt && (
                        <span className="text-[8px] font-mono text-brand-medium-gray tabular-nums shrink-0">
                          {formatDistanceToNow(new Date(job.lastRunAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active Projects compact */}
            {inProgressProjects.length > 0 && (
              <div className="forge-panel !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-warm-gray">
                  <span className="forge-label">Active Projects</span>
                </div>
                {inProgressProjects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-brand-warm-gray last:border-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
                    <span className="text-[10px] font-mono text-brand-ink flex-1 truncate">{project.name}</span>
                    <span className="text-[8px] font-mono text-brand-medium-gray shrink-0">{project.client ?? 'Internal'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
