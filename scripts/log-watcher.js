#!/usr/bin/env node
/**
 * log-watcher.js — OpenClaw → Mission Control live sync
 *
 * Watches .openclaw/agents/*/sessions/*.jsonl files for new lines,
 * parses agent activity (model calls, tool uses, token costs) and
 * pushes everything to Supabase in real-time.
 *
 * Usage:
 *   node scripts/log-watcher.js
 *   node scripts/log-watcher.js --once   (single pass, then exit — good for cron)
 *
 * Env vars (reads from .env.local in this directory, or process env):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENCLAW_DIR   (default: C:\Users\broug\.openclaw)
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const ONCE = process.argv.includes('--once');
const POLL_MS = 5000; // re-scan every 5 seconds

// Load .env.local from the script's parent directory
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();
const OPENCLAW_DIR = (process.env.OPENCLAW_DIR ?? 'C:\\Users\\broug\\.openclaw').trim();
const AGENTS_DIR   = path.join(OPENCLAW_DIR, 'agents');
const CURSOR_FILE  = path.join(__dirname, '.log-watcher-cursor.json');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[log-watcher] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// ── Supabase REST helper (no SDK dependency) ──────────────────────────────────

async function sbInsert(table, rows) {
  if (!rows.length) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[log-watcher] Insert ${table} failed: ${res.status} ${text}`);
  }
}

async function sbUpsert(table, rows, onConflict) {
  if (!rows.length) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[log-watcher] Upsert ${table} failed: ${res.status} ${text}`);
  }
}

// ── Cursor (tracks byte position per file) ────────────────────────────────────

function loadCursors() {
  try { return JSON.parse(fs.readFileSync(CURSOR_FILE, 'utf-8')); }
  catch { return {}; }
}

function saveCursors(cursors) {
  fs.writeFileSync(CURSOR_FILE, JSON.stringify(cursors, null, 2));
}

// ── Discover session files ─────────────────────────────────────────────────────

function findSessionFiles() {
  const files = [];
  if (!fs.existsSync(AGENTS_DIR)) return files;
  for (const agent of fs.readdirSync(AGENTS_DIR)) {
    const sessDir = path.join(AGENTS_DIR, agent, 'sessions');
    if (!fs.existsSync(sessDir)) continue;
    for (const f of fs.readdirSync(sessDir)) {
      if (f.endsWith('.jsonl')) {
        files.push({ agentName: agent, filePath: path.join(sessDir, f) });
      }
    }
  }
  return files;
}

// ── Parse a single JSONL line into structured data ────────────────────────────

function parseLine(raw, agentName) {
  let evt;
  try { evt = JSON.parse(raw); } catch { return null; }

  // Only care about assistant messages with usage data
  if (evt.type !== 'message') return null;
  const msg = evt.message;
  if (!msg || msg.role !== 'assistant') return null;
  if (!msg.usage || msg.usage.totalTokens === 0) return null;

  const usage   = msg.usage;
  const cost    = usage.cost?.total ?? 0;
  const model   = msg.model ?? 'unknown';
  const ts      = evt.timestamp ?? new Date().toISOString();
  const content = Array.isArray(msg.content) ? msg.content : [];
  const toolCalls = content.filter(c => c.type === 'toolCall');
  const isError   = msg.stopReason === 'error';

  // Derive a short task description
  let task = null;
  if (toolCalls.length > 0) {
    const t = toolCalls[0];
    task = `${t.name}(${t.arguments?.command ?? t.arguments?.action ?? Object.keys(t.arguments ?? {})[0] ?? ''})`.slice(0, 120);
  } else {
    const textBlock = content.find(c => c.type === 'text' && c.text?.trim());
    if (textBlock) task = textBlock.text.trim().slice(0, 120);
  }

  return {
    agentName,
    model,
    provider: msg.provider ?? 'unknown',
    tokensIn:  usage.input  ?? 0,
    tokensOut: usage.output ?? 0,
    totalTokens: usage.totalTokens ?? 0,
    cost,
    toolCalls,
    task,
    isError,
    errorMessage: msg.errorMessage ?? null,
    stopReason: msg.stopReason ?? 'endTurn',
    timestamp: ts,
  };
}

// ── Build Supabase rows from parsed event ─────────────────────────────────────

function buildRows(parsed) {
  const agentLogs  = [];
  const tokenLogs  = [];
  const ts = parsed.timestamp;

  // One token_log per LLM response
  tokenLogs.push({
    agent:      parsed.agentName,
    model:      parsed.model,
    tokens_in:  parsed.tokensIn,
    tokens_out: parsed.tokensOut,
    cost_usd:   parsed.cost,
    created_at: ts,
  });

  // One agent_log per tool call (or one for the response if no tool calls)
  if (parsed.toolCalls.length > 0) {
    for (const tc of parsed.toolCalls) {
      const args = tc.arguments ?? {};
      const pathStr = args.command ?? args.workdir ?? args.target ?? args.sessionId ?? JSON.stringify(args).slice(0, 200);
      agentLogs.push({
        agent_name: parsed.agentName,
        action:     tc.name,
        path:       pathStr,
        model:      parsed.model,
        tokens_in:  parsed.tokensIn,
        tokens_out: parsed.tokensOut,
        tokens:     parsed.totalTokens,
        cost:       parsed.cost,
        created_at: ts,
      });
    }
  } else {
    agentLogs.push({
      agent_name: parsed.agentName,
      action:     parsed.isError ? 'error' : 'response',
      path:       parsed.errorMessage?.slice(0, 200) ?? parsed.task,
      model:      parsed.model,
      tokens_in:  parsed.tokensIn,
      tokens_out: parsed.tokensOut,
      tokens:     parsed.totalTokens,
      cost:       parsed.cost,
      created_at: ts,
    });
  }

  return { agentLogs, tokenLogs };
}

// ── Agent status aggregator (tracks per-agent latest state in memory) ──────────

const agentLatest = {}; // agentName → { status, task, last_seen, model }

function updateAgentLatest(parsed) {
  const prev = agentLatest[parsed.agentName] ?? {};
  agentLatest[parsed.agentName] = {
    agent_name: parsed.agentName,
    status:     parsed.isError ? 'Error' : parsed.stopReason === 'toolUse' ? 'Working' : 'Idle',
    task:       parsed.task ?? prev.task,
    last_seen:  parsed.timestamp,
    metadata:   { model: parsed.model, provider: parsed.provider },
  };
}

async function flushAgentStatuses() {
  const rows = Object.values(agentLatest);
  if (!rows.length) return;
  await sbUpsert('agent_status', rows, 'agent_name');
}

// ── Process a single file for new lines ──────────────────────────────────────

async function processFile(agentName, filePath, cursors) {
  let stat;
  try { stat = fs.statSync(filePath); } catch { return; }

  const cursor = cursors[filePath] ?? 0;
  if (stat.size <= cursor) return; // nothing new

  const fd = fs.openSync(filePath, 'r');
  const buf = Buffer.allocUnsafe(stat.size - cursor);
  fs.readSync(fd, buf, 0, buf.length, cursor);
  fs.closeSync(fd);
  cursors[filePath] = stat.size;

  const lines = buf.toString('utf-8').split('\n').filter(l => l.trim());
  const allAgentLogs = [];
  const allTokenLogs = [];

  for (const line of lines) {
    const parsed = parseLine(line, agentName);
    if (!parsed) continue;
    const { agentLogs, tokenLogs } = buildRows(parsed);
    allAgentLogs.push(...agentLogs);
    allTokenLogs.push(...tokenLogs);
    updateAgentLatest(parsed);
  }

  if (allAgentLogs.length) await sbInsert('agent_logs', allAgentLogs);
  if (allTokenLogs.length) await sbInsert('token_logs', allTokenLogs);

  if (allAgentLogs.length || allTokenLogs.length) {
    console.log(`[log-watcher] ${agentName}: +${allAgentLogs.length} actions, +${allTokenLogs.length} token logs`);
  }
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function scan() {
  const cursors = loadCursors();
  const files   = findSessionFiles();

  for (const { agentName, filePath } of files) {
    await processFile(agentName, filePath, cursors);
  }

  await flushAgentStatuses();
  saveCursors(cursors);
}

async function main() {
  console.log(`[log-watcher] Starting — watching ${AGENTS_DIR}`);
  console.log(`[log-watcher] Supabase: ${SUPABASE_URL}`);

  await scan();

  if (ONCE) {
    console.log('[log-watcher] --once mode, exiting.');
    return;
  }

  console.log(`[log-watcher] Polling every ${POLL_MS / 1000}s. Ctrl+C to stop.`);
  setInterval(scan, POLL_MS);
}

main().catch(err => {
  console.error('[log-watcher] Fatal:', err);
  process.exit(1);
});
