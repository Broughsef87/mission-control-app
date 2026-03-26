/**
 * db.ts — centralized Supabase query functions for Mission Control
 * All pages and API routes import from here instead of calling supabase directly.
 */

import { getSupabaseAdmin } from './supabase';

// Lazy singleton — resolved at runtime so env vars are always available
function db() { return getSupabaseAdmin(); }

// ── PROJECTS ────────────────────────────────────────────────

export async function getProjects() {
  const { data, error } = await db()
    .from('projects')
    .select('*, tasks(count)')
    .order('priority', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createProject(payload: {
  name: string; status: string; description?: string;
  client?: string; budget?: string; deadline?: string; priority?: number;
}) {
  const { data, error } = await db().from('projects').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, payload: Partial<{
  name: string; status: string; description: string;
  client: string; budget: string; deadline: string; priority: number;
}>) {
  const { data, error } = await db().from('projects').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await db().from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ── REVENUE ─────────────────────────────────────────────────

export async function getRevenue(limit = 50) {
  const { data, error } = await db()
    .from('revenue')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getRevenueMTD() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await db()
    .from('revenue')
    .select('amount, category')
    .gte('date', startOfMonth.toISOString().split('T')[0]);
  if (error) throw error;

  const total = (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const byCategory: Record<string, number> = {};
  for (const r of data ?? []) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + Number(r.amount);
  }
  return { total, byCategory };
}

export async function createRevenue(payload: {
  date: string; amount: number; source: string; category: string; notes?: string;
}) {
  const { data, error } = await db().from('revenue').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRevenue(id: string) {
  const { error } = await db().from('revenue').delete().eq('id', id);
  if (error) throw error;
}

// ── NOTIFICATIONS ────────────────────────────────────────────

export async function getNotifications(limit = 30) {
  const { data, error } = await db()
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await db().from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await db().from('notifications').update({ read: true }).eq('read', false);
  if (error) throw error;
}

export async function createNotification(payload: {
  type: string; title: string; body?: string; source?: string;
}) {
  const { error } = await db().from('notifications').insert(payload);
  if (error) throw error;
}

// ── CONTENT ITEMS ────────────────────────────────────────────

export async function getContentItems() {
  const { data, error } = await db()
    .from('content_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createContentItem(payload: {
  title: string; channel: string; status: string; priority: string; type: string; notes?: string;
}) {
  const { data, error } = await db().from('content_items').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateContentItem(id: string, payload: Partial<{
  title: string; channel: string; status: string; priority: string; type: string; notes: string;
}>) {
  const { data, error } = await db().from('content_items').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContentItem(id: string) {
  const { error } = await db().from('content_items').delete().eq('id', id);
  if (error) throw error;
}

// ── CLIENTS (CRM) ────────────────────────────────────────────

export async function getClients() {
  const { data, error } = await db()
    .from('clients')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createClient(payload: {
  name: string; pipeline_stage: string; contract_value?: number;
  contact_name?: string; contact_email?: string; renewal_date?: string; notes?: string;
}) {
  const { data, error } = await db().from('clients').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, payload: Partial<{
  name: string; pipeline_stage: string; contract_value: number;
  contact_name: string; contact_email: string; renewal_date: string; notes: string;
}>) {
  const { data, error } = await db().from('clients').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await db().from('clients').delete().eq('id', id);
  if (error) throw error;
}

// ── AGENTS ──────────────────────────────────────────────────

export async function getAgentStatuses() {
  const { data, error } = await db()
    .from('agent_status')
    .select('*')
    .order('last_seen', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAgentLogs(limit = 50) {
  const { data, error } = await db()
    .from('agent_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getAgentCostSummary() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await db()
    .from('agent_logs')
    .select('agent_name, cost, tokens')
    .gte('created_at', startOfMonth.toISOString());
  if (error) throw error;

  const byAgent: Record<string, { cost: number; tokens: number; actions: number }> = {};
  for (const log of data ?? []) {
    if (!byAgent[log.agent_name]) byAgent[log.agent_name] = { cost: 0, tokens: 0, actions: 0 };
    byAgent[log.agent_name].cost += Number(log.cost ?? 0);
    byAgent[log.agent_name].tokens += Number(log.tokens ?? 0);
    byAgent[log.agent_name].actions += 1;
  }
  return byAgent;
}

export async function getDailyCosts(days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await db()
    .from('agent_logs')
    .select('cost, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });
  if (error) throw error;

  const byDay: Record<string, number> = {};
  for (const log of data ?? []) {
    const day = log.created_at.split('T')[0];
    byDay[day] = (byDay[day] ?? 0) + Number(log.cost ?? 0);
  }
  return byDay;
}

// ── PLATFORM METRICS ─────────────────────────────────────────

export async function getLatestMetrics() {
  const { data, error } = await db()
    .from('platform_metrics')
    .select('*')
    .order('recorded_at', { ascending: false });
  if (error) throw error;

  const latest: Record<string, Record<string, string>> = {};
  for (const row of data ?? []) {
    if (!latest[row.platform]) latest[row.platform] = {};
    if (!latest[row.platform][row.metric_key]) {
      latest[row.platform][row.metric_key] = row.metric_value;
    }
  }
  return latest;
}

export async function upsertMetric(platform: string, metric_key: string, metric_value: string) {
  const { error } = await db().from('platform_metrics').insert({ platform, metric_key, metric_value });
  if (error) throw error;
}

// ── DAILY LOGS ───────────────────────────────────────────────

export async function getDailyLogs(limit = 60) {
  const { data, error } = await db()
    .from('daily_logs')
    .select('*')
    .order('log_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function upsertDailyLog(log_date: string, content: string) {
  const { error } = await db()
    .from('daily_logs')
    .upsert({ log_date, content, synced_at: new Date().toISOString() }, { onConflict: 'log_date' });
  if (error) throw error;
}

// ── DAILY BRIEFING ───────────────────────────────────────────

export async function getLatestBriefing() {
  const { data, error } = await db()
    .from('daily_briefings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function createBriefing(content: string, metrics_snapshot: Record<string, unknown>) {
  const { data, error } = await db()
    .from('daily_briefings')
    .insert({ content, metrics_snapshot })
    .select()
    .single();
  if (error) throw error;
  return data;
}
