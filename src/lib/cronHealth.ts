/**
 * cronHealth.ts — reads OpenClaw cron/jobs.json and returns job health
 * Server-side only (uses fs). Called from Server Components.
 */

import fs from 'fs';
import path from 'path';

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;              // human-readable
  expectedIntervalHours: number | null; // null = one-time / unknown
  lastRunAt: number | null;
  lastRunStatus: 'ok' | 'error' | 'skipped' | 'never';
  stalenessStatus: 'ok' | 'stale' | 'critical' | 'never' | 'disabled' | 'one-time';
  lastError: string | null;
  nextRunAt: number | null;
  consecutiveErrors: number;
}

const JOBS_PATH =
  process.env.OPENCLAW_CRON_PATH ??
  path.join('C:', 'Users', 'broug', '.openclaw', 'cron', 'jobs.json');

function humanSchedule(schedule: any): string {
  if (!schedule) return '—';
  if (schedule.kind === 'every') {
    const ms = schedule.everyMs;
    if (ms < 60_000) return `every ${Math.round(ms / 1000)}s`;
    if (ms < 3_600_000) return `every ${Math.round(ms / 60_000)}m`;
    return `every ${Math.round(ms / 3_600_000)}h`;
  }
  if (schedule.kind === 'cron') {
    const expr = schedule.expr ?? '';
    const tz = schedule.tz ? ` (${schedule.tz.replace('America/', '')})` : '';
    const patterns: Record<string, string> = {
      '0 7 * * *':     'Daily 7 AM',
      '0 8 * * *':     'Daily 8 AM',
      '0 9 * * *':     'Daily 9 AM',
      '0 13 * * *':    'Daily 1 PM',
      '0 19 * * *':    'Daily 7 PM',
      '0 21 * * *':    'Daily 9 PM',
      '30 21 * * *':   'Daily 9:30 PM',
      '0 3 * * *':     'Daily 3 AM',
      '0 8 * * 5':     'Fridays 8 AM',
      '0 17 * * 5':    'Fridays 5 PM',
      '0 6 * * 1':     'Mondays 6 AM',
      '0 20 * * 0':    'Sundays 8 PM',
      '30 5 * * 1,3,5':'Mon/Wed/Fri 5:30 AM',
    };
    return (patterns[expr] ?? expr) + tz;
  }
  if (schedule.kind === 'at') {
    const d = new Date(schedule.at);
    return `Once: ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return '—';
}

/** Compute expected interval in hours from the schedule definition */
function expectedInterval(schedule: any): number | null {
  if (!schedule) return null;
  if (schedule.kind === 'every') {
    return schedule.everyMs / 3_600_000;
  }
  if (schedule.kind === 'at') {
    return null; // one-time
  }
  if (schedule.kind === 'cron') {
    const expr: string = schedule.expr ?? '';
    // Daily patterns  (* * * *)
    if (/^\S+ \S+ \* \* \*$/.test(expr)) return 24;
    // Weekly single day  (* * * * N)
    if (/^\S+ \S+ \* \* \d$/.test(expr)) return 168;
    // Mon+Wed+Fri
    if (/^\S+ \S+ \* \* 1,3,5$/.test(expr)) return 48;
    return 24; // default assumption
  }
  return null;
}

/** Compute staleness from timing vs expected interval */
function computeStaleness(
  enabled: boolean,
  lastRunAt: number | null,
  lastRunStatus: string,
  intervalHours: number | null,
): CronJob['stalenessStatus'] {
  if (!enabled) return 'disabled';
  if (intervalHours === null) return 'one-time';
  if (lastRunAt === null) return 'never';
  if (lastRunStatus === 'error') return 'critical';

  const ageHours = (Date.now() - lastRunAt) / 3_600_000;
  if (ageHours <= intervalHours * 1.5) return 'ok';
  if (ageHours <= intervalHours * 3) return 'stale';
  return 'critical';
}

export function getCronHealth(): CronJob[] {
  try {
    const raw = fs.readFileSync(JOBS_PATH, 'utf-8');
    const { jobs } = JSON.parse(raw) as { jobs: any[] };

    return jobs.map(j => {
      const enabled = j.enabled ?? true;
      const lastRunAt: number | null = j.state?.lastRunAtMs ?? null;
      const lastRunStatus = (j.state?.lastRunStatus as CronJob['lastRunStatus']) ?? 'never';
      const intervalHours = expectedInterval(j.schedule);

      return {
        id: j.id,
        name: j.name,
        enabled,
        schedule: humanSchedule(j.schedule),
        expectedIntervalHours: intervalHours,
        lastRunAt,
        lastRunStatus,
        stalenessStatus: computeStaleness(enabled, lastRunAt, lastRunStatus, intervalHours),
        lastError: j.state?.lastError ?? null,
        nextRunAt: j.state?.nextRunAtMs ?? null,
        consecutiveErrors: j.state?.consecutiveErrors ?? 0,
      };
    });
  } catch {
    return [];
  }
}
