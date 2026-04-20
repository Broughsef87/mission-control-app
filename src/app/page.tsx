import { getProjects, getPendingApprovals, getRevenueMTD, getAgentLogs, getCheckinByDate } from '@/lib/db';
import { parseCheckinContent } from '@/lib/parseCheckin';
import { getCronHealth } from '@/lib/cronHealth';
import ApprovalsPanel from '@/components/ApprovalsPanel';
import Link from 'next/link';
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

  const [projects, revenueMTD, agentLogs, approvals, todayRow, yesterdayRow] = await Promise.all([
    getProjects().catch(() => []),
    getRevenueMTD().catch(() => ({ total: 0, byCategory: {} })),
    getAgentLogs(12).catch(() => []),
    getPendingApprovals().catch(() => []),
    getCheckinByDate(today).catch(() => null),
    getCheckinByDate(yd).catch(() => null),
  ]);

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
    <div className="space-y-10 max-w-5xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-warm-gray pb-6">
        <div>
          <h1 className="forge-heading text-4xl sm:text-5xl mb-1">
            Mission <span className="text-brand-gold">Control</span>
          </h1>
          <p className="text-brand-medium-gray font-mono text-xs uppercase tracking-[0.25em]">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {checkin.found && !usingFallback ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-green-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Check-in found
            </span>
          ) : usingFallback ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Using {fallbackDate} priorities
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
              No check-in today
            </span>
          )}
          <Link
            href="/checkin"
            className="flex items-center gap-1.5 border border-brand-warm-gray text-brand-slate text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full hover:border-brand-gold hover:text-brand-gold transition-colors"
          >
            + Check-in
          </Link>
          {(approvals as any[]).length > 0 && (
            <Link
              href="/approvals"
              className="flex items-center gap-1.5 bg-brand-gold text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
            >
              {(approvals as any[]).length} approval{(approvals as any[]).length !== 1 ? 's' : ''} pending
            </Link>
          )}
        </div>
      </header>

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
                <span className="text-[8px] font-mono text-amber-600 uppercase tracking-widest">No check-in today</span>
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
                <div className="forge-label mb-1 text-red-500">Blocker</div>
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
            <span className="text-[9px] font-mono text-green-600 font-bold uppercase tracking-widest">— All clear</span>
          )}
        </div>

        {missingCheckin && (
          <div className="forge-panel mb-4" style={{ borderColor: 'var(--color-amber)', backgroundColor: 'var(--color-amber-bg)' }}>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
              <div>
                <div className="text-xs font-bold text-amber-800 mb-0.5">No daily check-in for {today}</div>
                <p className="text-[11px] text-amber-700 italic">
                  Create <code className="bg-amber-100 px-1 py-0.5 rounded text-[10px]">workspace/memory/checkins/{today}.md</code>{' '}
                  to populate priorities, KPIs, and blockers.
                </p>
              </div>
            </div>
          </div>
        )}

        <ApprovalsPanel />
      </section>

      {/* ── BUSINESS MOVEMENT ──────────────────────────────────── */}
      <section>
        <div className="forge-label mb-4">Business Movement</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenue MTD',    value: `$${(revenueMTD as any).total.toLocaleString()}`, sub: 'Goal: $1M/yr', color: 'text-brand-gold' },
            { label: 'Active Clients', value: String((projects as any[]).filter((p: any) => p.client && p.client !== 'Internal' && p.status === 'In Progress').length), sub: 'Forge Agency', color: 'text-brand-ink' },
            { label: 'In Progress',    value: String(inProgressProjects.length), sub: 'Projects', color: 'text-brand-ink' },
            { label: 'Approvals',      value: String((approvals as any[]).length || '—'), sub: 'Pending review', color: (approvals as any[]).length > 0 ? 'text-amber-600' : 'text-brand-ink' },
          ].map(kpi => (
            <div key={kpi.label} className="forge-card rounded-2xl p-4">
              <div className="forge-label mb-1">{kpi.label}</div>
              <div className={`text-2xl font-black font-mono tabular-nums ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[9px] font-mono text-brand-medium-gray uppercase mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Wins + Decisions from most recent EOD check-in */}
        {(checkin.wins.length > 0 || checkin.decisions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {checkin.wins.length > 0 && (
              <div className="forge-panel">
                <div className="forge-label mb-3 text-green-600">
                  {usingFallback ? `Wins — ${fallbackDate}` : "Today's Wins"}
                </div>
                <ul className="space-y-2">
                  {checkin.wins.map((w, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-brand-ink">
                      <span className="text-green-500 shrink-0">✓</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {checkin.decisions.length > 0 && (
              <div className="forge-panel">
                <div className="forge-label mb-3">
                  {usingFallback ? `Decisions — ${fallbackDate}` : 'Decisions Made'}
                </div>
                <ul className="space-y-2">
                  {checkin.decisions.map((d, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-brand-ink">
                      <span className="text-brand-gold shrink-0">→</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── ACTIVE PROJECTS ────────────────────────────────────── */}
      {inProgressProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="forge-label">Active Projects</div>
            <Link href="/projects" className="text-[9px] font-mono font-bold text-brand-gold uppercase tracking-widest hover:text-brand-ink transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressProjects.slice(0, 6).map((project: any) => (
              <div key={project.id} className="forge-panel">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="forge-heading text-sm leading-tight">{project.name}</h3>
                  <span className="text-[8px] font-bold uppercase px-2 py-0.5 border border-brand-gold text-brand-gold bg-brand-gold/5 rounded shrink-0">
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-[11px] text-brand-slate italic line-clamp-2 mb-3">{project.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-brand-warm-gray">
                  <span className="text-[9px] font-mono text-brand-medium-gray uppercase">{project.client ?? 'Internal'}</span>
                  {project.deadline && (
                    <span className="text-[9px] font-mono text-brand-medium-gray">Due {project.deadline}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CRON HEALTH ────────────────────────────────────────── */}
      {cronJobs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="forge-label">Agent Run Health</div>
            <span className="text-[9px] font-mono text-brand-medium-gray">
              {cronJobs.filter(j => j.lastRunStatus === 'ok').length}/{cronJobs.length} OK
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cronJobs.map(job => {
              const statusColor =
                !job.enabled ? 'text-brand-medium-gray' :
                job.lastRunStatus === 'ok' ? 'text-green-600' :
                job.lastRunStatus === 'error' ? 'text-red-500' :
                job.lastRunStatus === 'never' ? 'text-amber-500' :
                'text-brand-medium-gray';
              const dot =
                !job.enabled ? 'bg-brand-medium-gray' :
                job.lastRunStatus === 'ok' ? 'bg-green-500' :
                job.lastRunStatus === 'error' ? 'bg-red-500 animate-pulse' :
                job.lastRunStatus === 'never' ? 'bg-amber-400' :
                'bg-brand-medium-gray';
              return (
                <div key={job.id} className="forge-card rounded-xl p-3.5">
                  <div className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-brand-ink leading-tight truncate">{job.name}</div>
                      <div className="text-[9px] font-mono text-brand-medium-gray mt-0.5">{job.schedule}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[9px] font-mono font-bold uppercase ${statusColor}`}>
                      {!job.enabled ? 'Disabled' : job.lastRunStatus}
                      {job.consecutiveErrors > 1 ? ` ×${job.consecutiveErrors}` : ''}
                    </span>
                    {job.lastRunAt && (
                      <span className="text-[8px] font-mono text-brand-medium-gray">
                        {formatDistanceToNow(new Date(job.lastRunAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {job.lastError && job.lastRunStatus === 'error' && (
                    <div className="mt-1.5 text-[9px] font-mono text-red-500 truncate" title={job.lastError}>
                      {job.lastError}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── RECENT EXECUTION ───────────────────────────────────── */}
      {(agentLogs as any[]).length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="forge-label">Recent Execution</div>
            <Link href="/agents" className="text-[9px] font-mono font-bold text-brand-gold uppercase tracking-widest hover:text-brand-ink transition-colors">
              View All →
            </Link>
          </div>
          <div className="forge-panel !p-0 overflow-hidden">
            {(agentLogs as any[]).map((log: any, i: number) => (
              <div
                key={log.id ?? i}
                className="flex items-start gap-4 px-5 py-3 border-b border-brand-warm-gray last:border-0 hover:bg-brand-parchment transition-colors"
              >
                <div className="text-[9px] font-mono text-brand-medium-gray shrink-0 w-16 pt-0.5 tabular-nums">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-brand-gold uppercase mr-1.5">{log.agent_name}</span>
                  <span className="text-[11px] text-brand-slate">
                    {[log.action, log.path].filter(Boolean).join(' — ')}
                  </span>
                </div>
                {Number(log.cost) > 0 && (
                  <div className="text-[9px] font-mono text-brand-medium-gray shrink-0 tabular-nums">
                    ${Number(log.cost).toFixed(4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
