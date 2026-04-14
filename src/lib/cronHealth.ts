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
  schedule: string; // human-readable
  lastRunAt: number | null;
  lastRunStatus: 'ok' | 'error' | 'skipped' | 'never';
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
    // Map common patterns
    const expr = schedule.expr ?? '';
    const tz = schedule.tz ? ` (${schedule.tz.replace('America/', '')})` : '';
    const patterns: Record<string, string> = {
      '0 7 * * *': 'Daily 7 AM',
      '0 9 * * *': 'Daily 9 AM',
      '0 13 * * *': 'Daily 1 PM',
      '0 8 * * 5': 'Fridays 8 AM',
    };
    return (patterns[expr] ?? expr) + tz;
  }
  return '—';
}

export function getCronHealth(): CronJob[] {
  try {
    const raw = fs.readFileSync(JOBS_PATH, 'utf-8');
    const { jobs } = JSON.parse(raw) as { jobs: any[] };

    return jobs.map(j => ({
      id: j.id,
      name: j.name,
      enabled: j.enabled ?? true,
      schedule: humanSchedule(j.schedule),
      lastRunAt: j.state?.lastRunAtMs ?? null,
      lastRunStatus: (j.state?.lastRunStatus as CronJob['lastRunStatus']) ?? 'never',
      lastError: j.state?.lastError ?? null,
      nextRunAt: j.state?.nextRunAtMs ?? null,
      consecutiveErrors: j.state?.consecutiveErrors ?? 0,
    }));
  } catch {
    return [];
  }
}
