import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SignalItem {
  label: string;
  weight: number;
  source: string;
  link?: string;
}

interface SummaryResponse {
  date: string;
  top3: SignalItem[];
  decisionsNeeded: any[];
  watchThis: any[];
  revenueSignals: any[];
  calendarPrep: any[];
  agentUpdates: any[];
  accountability: {
    yesterdayCommitments: any[];
    completed: any[];
    missed: any[];
  } | null;
  meta: {
    generatedAt: string;
    sourceStatus: Record<string, string>;
  };
}

// ── 60-second in-memory cache ─────────────────────────────────────────────────

let _cache: { data: SummaryResponse; ts: number } | null = null;
const CACHE_TTL = 60_000;

// ── Signal weight rubric ──────────────────────────────────────────────────────

const W = {
  REVENUE_AT_RISK:    100,
  CLIENT_COMMITMENT:   85,
  INTERNAL_BLOCKER:    70,
  PENDING_DECISION:    60,
  CALENDAR_PREP:       50,
  CONTENT_CADENCE:     35,
  NICE_TO_HAVE:        10,
} as const;

// ── Data fetchers (each throws on failure — caught in allSettled) ──────────────

async function fetchStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('not configured');
  const stripe = new Stripe(key);

  const weekAgo = Math.floor((Date.now() - 7 * 86_400_000) / 1000);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthTs = Math.floor(monthStart.getTime() / 1000);

  const [charges, disputes, subs] = await Promise.all([
    stripe.charges.list({ created: { gte: weekAgo }, limit: 100 }),
    stripe.disputes.list({ created: { gte: weekAgo }, limit: 20 }),
    stripe.subscriptions.list({ status: 'active', limit: 100 }),
  ]);

  const failedPayments = charges.data.filter(c => c.status === 'failed');
  const mrr = subs.data.reduce((sum, sub) => {
    const item = sub.items.data[0];
    if (!item) return sum;
    const amount = item.price.unit_amount ?? 0;
    return sum + (item.price.recurring?.interval === 'year' ? Math.round(amount / 12) : amount);
  }, 0);

  return {
    failedPayments,
    disputes: disputes.data,
    mrr,
    activeSubscriptions: subs.data.length,
  };
}

async function fetchLinear() {
  const key = process.env.LINEAR_API_KEY?.trim();
  if (!key) throw new Error('not configured');

  const yesterday = new Date(Date.now() - 86_400_000).toISOString();

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: key },
    body: JSON.stringify({
      query: `
        query SynthesisEngine($yd: NullableDateComparator) {
          inProgress: issues(
            filter: { state: { type: { in: ["started"] } } }
            first: 50
            orderBy: updatedAt
          ) {
            nodes { id title dueDate updatedAt state { name type } team { name } assignee { name } }
          }
          blocked: issues(
            filter: { state: { name: { containsIgnoreCase: "blocked" } } }
            first: 20
          ) {
            nodes { id title team { name } updatedAt }
          }
          startedYesterday: issues(
            filter: { startedAt: $yd }
            first: 30
          ) {
            nodes { id title state { name type } team { name } completedAt startedAt }
          }
          completedYesterday: issues(
            filter: { completedAt: $yd }
            first: 30
          ) {
            nodes { id title team { name } completedAt }
          }
        }
      `,
      variables: { yd: { gte: yesterday } },
    }),
  });

  if (!res.ok) throw new Error(`Linear ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as {
    inProgress: { nodes: any[] };
    blocked: { nodes: any[] };
    startedYesterday: { nodes: any[] };
    completedYesterday: { nodes: any[] };
  };
}

async function fetchCalendar() {
  const personalRefresh  = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN_PERSONAL?.trim();
  const workspaceRefresh = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN_WORKSPACE?.trim();
  const clientId         = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret     = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret || (!personalRefresh && !workspaceRefresh)) {
    throw new Error('not configured');
  }

  async function exchangeToken(refresh: string): Promise<string | null> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!, client_secret: clientSecret!,
        refresh_token: refresh, grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) return null;
    return (await res.json()).access_token ?? null;
  }

  async function fetchEvents(accessToken: string, source: string): Promise<any[]> {
    const now   = new Date();
    const in24h = new Date(now.getTime() + 24 * 3_600_000);
    const url   = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.set('timeMin', now.toISOString());
    url.searchParams.set('timeMax', in24h.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');
    url.searchParams.set('maxResults', '15');

    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((e: any) => ({ ...e, calSource: source }));
  }

  const [pt, wt] = await Promise.all([
    personalRefresh  ? exchangeToken(personalRefresh)  : Promise.resolve(null),
    workspaceRefresh ? exchangeToken(workspaceRefresh) : Promise.resolve(null),
  ]);

  const [pe, we] = await Promise.all([
    pt ? fetchEvents(pt, 'personal')  : Promise.resolve([]),
    wt ? fetchEvents(wt, 'workspace') : Promise.resolve([]),
  ]);

  const seen = new Set<string>();
  return [...pe, ...we]
    .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
    .sort((a, b) => (a.start?.dateTime ?? a.start?.date ?? '').localeCompare(b.start?.dateTime ?? b.start?.date ?? ''));
}

async function fetchApprovals(): Promise<any[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('pending_approvals')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchAgentLogs(): Promise<any[]> {
  const db = getSupabaseAdmin();
  const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { data, error } = await db
    .from('agent_logs')
    .select('agent_name, action, cost, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(150);
  if (error) throw error;
  return data ?? [];
}

async function fetchYesterdayCheckin() {
  const db = getSupabaseAdmin();
  const yd = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
  const { data, error } = await db
    .from('checkins')
    .select('commitments, priorities, date')
    .eq('date', yd)
    .maybeSingle();
  if (error) throw error;
  return data as { commitments?: string[]; priorities?: string[]; date: string } | null;
}

// ── Haiku synthesis (best-effort; raw labels used on failure) ──────────────────

async function refineLabelsWithHaiku(raw: string[]): Promise<string[]> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || raw.length === 0) return raw;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: [
        {
          type: 'text',
          text: 'You are a terse executive decision engine. Rewrite each business signal as a crisp, action-oriented 8–12 word imperative (present tense). Return ONLY a valid JSON array of strings in the same order as input. No markdown, no explanation.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: JSON.stringify(raw) }],
    }),
  });

  if (!res.ok) return raw;
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  try {
    const labels = JSON.parse(text);
    if (Array.isArray(labels) && labels.length === raw.length) return labels;
  } catch {}
  return raw;
}

// ── Main handler ───────────────────────────────────────────────────────────────

export async function GET() {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) {
    return NextResponse.json(_cache.data, { headers: { 'X-Cache': 'HIT' } });
  }

  const sourceStatus: Record<string, string> = {};

  const [stripeRes, linearRes, calendarRes, approvalsRes, agentLogsRes, checkinRes] =
    await Promise.allSettled([
      fetchStripe(),
      fetchLinear(),
      fetchCalendar(),
      fetchApprovals(),
      fetchAgentLogs(),
      fetchYesterdayCheckin(),
    ]);

  function val<T>(r: PromiseSettledResult<T>): T | undefined {
    return r.status === 'fulfilled' ? r.value : undefined;
  }

  sourceStatus.stripe    = stripeRes.status    === 'fulfilled' ? 'ok' : (stripeRes    as PromiseRejectedResult).reason?.message ?? 'error';
  sourceStatus.linear    = linearRes.status    === 'fulfilled' ? 'ok' : (linearRes    as PromiseRejectedResult).reason?.message ?? 'error';
  sourceStatus.calendar  = calendarRes.status  === 'fulfilled' ? 'ok' : (calendarRes  as PromiseRejectedResult).reason?.message ?? 'error';
  sourceStatus.approvals = approvalsRes.status === 'fulfilled' ? 'ok' : (approvalsRes as PromiseRejectedResult).reason?.message ?? 'error';
  sourceStatus.agent_logs = agentLogsRes.status === 'fulfilled' ? 'ok' : (agentLogsRes as PromiseRejectedResult).reason?.message ?? 'error';
  sourceStatus.checkin   = checkinRes.status   === 'fulfilled' ? 'ok' : (checkinRes   as PromiseRejectedResult).reason?.message ?? 'error';

  const stripe    = val(stripeRes);
  const linear    = val(linearRes);
  const calendar  = val(calendarRes) ?? [];
  const approvals = val(approvalsRes) ?? [];
  const agentLogs = val(agentLogsRes) ?? [];
  const checkin   = val(checkinRes);

  // ── Collect signals ──────────────────────────────────────────────────────────

  const signals: SignalItem[] = [];

  // 1. Revenue at risk
  if ((stripe?.failedPayments.length ?? 0) > 0) {
    signals.push({
      label: `${stripe!.failedPayments.length} failed payment${stripe!.failedPayments.length > 1 ? 's' : ''} in the last 7 days`,
      weight: W.REVENUE_AT_RISK,
      source: 'stripe',
    });
  }
  if ((stripe?.disputes.length ?? 0) > 0) {
    signals.push({
      label: `${stripe!.disputes.length} open dispute${stripe!.disputes.length > 1 ? 's' : ''} on Stripe`,
      weight: W.REVENUE_AT_RISK - 5,
      source: 'stripe',
    });
  }

  // 2. Client commitment (overdue Linear issues)
  const now = new Date();
  const overdue = (linear?.inProgress.nodes ?? []).filter(
    (i: any) => i.dueDate && new Date(i.dueDate) < now
  );
  if (overdue.length > 0) {
    signals.push({
      label: `${overdue.length} overdue issue${overdue.length > 1 ? 's' : ''}: "${overdue[0].title}"`,
      weight: W.CLIENT_COMMITMENT,
      source: 'linear',
    });
  }

  // 3. Internal blocker
  const blocked = linear?.blocked.nodes ?? [];
  if (blocked.length > 0) {
    signals.push({
      label: `${blocked.length} blocked issue${blocked.length > 1 ? 's' : ''}: "${blocked[0].title}"`,
      weight: W.INTERNAL_BLOCKER,
      source: 'linear',
    });
  }

  // 4. Pending decision
  if (approvals.length > 0) {
    signals.push({
      label: `${approvals.length} approval${approvals.length > 1 ? 's' : ''} waiting on you`,
      weight: W.PENDING_DECISION,
      source: 'approvals',
    });
  }

  // 5. Calendar prep (meetings with attendees in next 24h)
  const upcomingWithAttendees = calendar.filter((e: any) => (e.attendees?.length ?? 0) > 1);
  if (upcomingWithAttendees.length > 0) {
    const next = upcomingWithAttendees[0];
    const timeStr = next.start?.dateTime
      ? new Date(next.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : 'today';
    signals.push({
      label: `"${next.summary}" at ${timeStr} — confirm prep`,
      weight: W.CALENDAR_PREP,
      source: 'calendar',
    });
  }

  // 6. Agent overnight activity (nice-to-have)
  const agentNames = [...new Set(agentLogs.map((l: any) => l.agent_name as string))];
  if (agentLogs.length > 0) {
    signals.push({
      label: `${agentLogs.length} agent actions overnight (${agentNames.slice(0, 3).join(', ')})`,
      weight: W.NICE_TO_HAVE,
      source: 'agent_logs',
    });
  }

  // ── Sort and take top 3, refine with Haiku ───────────────────────────────────

  signals.sort((a, b) => b.weight - a.weight);
  const top3raw = signals.slice(0, 3);
  const refinedLabels = await refineLabelsWithHaiku(top3raw.map(s => s.label));
  const top3: SignalItem[] = top3raw.map((s, i) => ({ ...s, label: refinedLabels[i] ?? s.label }));

  // ── Accountability block ──────────────────────────────────────────────────────

  const startedYesterday = linear?.startedYesterday.nodes ?? [];
  const completedYesterdayIds = new Set(
    (linear?.completedYesterday.nodes ?? []).map((i: any) => i.id as string)
  );

  const checkinCommitments: any[] = [
    ...(checkin?.commitments ?? []),
    ...(checkin?.priorities ?? []),
  ].map((c, idx) => ({ id: `checkin-${idx}`, label: c, source: 'checkin', status: 'unknown' }));

  const accountability =
    startedYesterday.length > 0 || checkinCommitments.length > 0
      ? {
          yesterdayCommitments: [
            ...startedYesterday.map((i: any) => ({
              id: i.id,
              label: i.title,
              source: 'linear',
              type: 'issue',
            })),
            ...checkinCommitments,
          ],
          completed: startedYesterday
            .filter(
              (i: any) =>
                i.state?.type === 'completed' || completedYesterdayIds.has(i.id)
            )
            .map((i: any) => ({ id: i.id, label: i.title, source: 'linear' })),
          missed: startedYesterday
            .filter(
              (i: any) =>
                i.state?.type !== 'completed' && !completedYesterdayIds.has(i.id)
            )
            .map((i: any) => ({ id: i.id, label: i.title, source: 'linear' })),
        }
      : null;

  // ── Categorized section outputs ───────────────────────────────────────────────

  const revenueSignals = stripe
    ? [
        { label: 'MRR', value: `$${Math.round(stripe.mrr / 100).toLocaleString()}` },
        { label: 'Active subscriptions', value: stripe.activeSubscriptions },
        { label: 'Failed payments (7d)', value: stripe.failedPayments.length, alert: stripe.failedPayments.length > 0 },
        { label: 'Open disputes (7d)', value: stripe.disputes.length, alert: stripe.disputes.length > 0 },
      ]
    : [];

  const decisionsNeeded = approvals.map((a: any) => ({
    id: a.id,
    label: a.description ?? a.task ?? 'Pending approval',
    source: a.agent_name ?? 'System',
    created_at: a.created_at,
  }));

  const watchThis = [
    ...blocked.map((i: any) => ({ id: i.id, label: i.title, source: 'linear', type: 'blocked' })),
    ...overdue.map((i: any) => ({
      id: i.id, label: i.title, source: 'linear', type: 'overdue', dueDate: i.dueDate,
    })),
    ...(linear?.inProgress.nodes ?? [])
      .filter((i: any) => {
        const days = (Date.now() - new Date(i.updatedAt).getTime()) / 86_400_000;
        return days > 7;
      })
      .map((i: any) => ({ id: i.id, label: i.title, source: 'linear', type: 'stale' })),
  ];

  const calendarPrep = upcomingWithAttendees.slice(0, 6).map((e: any) => ({
    label: e.summary,
    start: e.start?.dateTime ?? e.start?.date,
    attendees: (e.attendees ?? []).map((a: any) => a.displayName ?? a.email),
    source: e.calSource,
  }));

  const byAgent: Record<string, { actions: number; lastAction: string; cost: number }> = {};
  for (const log of agentLogs) {
    if (!byAgent[log.agent_name]) byAgent[log.agent_name] = { actions: 0, lastAction: '', cost: 0 };
    byAgent[log.agent_name].actions++;
    byAgent[log.agent_name].cost += Number(log.cost ?? 0);
    if (!byAgent[log.agent_name].lastAction) byAgent[log.agent_name].lastAction = log.action ?? '';
  }
  const agentUpdates = Object.entries(byAgent)
    .sort((a, b) => b[1].actions - a[1].actions)
    .map(([agent, s]) => ({
      agent,
      actions: s.actions,
      lastAction: s.lastAction,
      cost: `$${s.cost.toFixed(2)}`,
    }));

  // ── Assemble and cache ────────────────────────────────────────────────────────

  const result: SummaryResponse = {
    date: new Date().toISOString().split('T')[0],
    top3,
    decisionsNeeded,
    watchThis,
    revenueSignals,
    calendarPrep,
    agentUpdates,
    accountability,
    meta: {
      generatedAt: new Date().toISOString(),
      sourceStatus,
    },
  };

  _cache = { data: result, ts: Date.now() };
  return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } });
}
