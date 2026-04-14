/**
 * parseCheckin.ts — reads and parses daily check-in markdown files
 * Source: workspace/memory/checkins/YYYY-MM-DD.md
 *
 * Handles two real formats:
 *
 * FORMAT A — EOD check-in (detailed):
 *   ## 1. Completed
 *   ## 2. Blocked / Unfinished
 *   ## 3. Wins / Insights / Decisions
 *   ## 4. First Move Tomorrow   ← becomes priorities
 *   ## 5. Numbers / Updates     ← becomes kpi / revenueNote
 *
 * FORMAT B — Minimal (agent-generated):
 *   Priority 1 (name): value
 *   Priority 2 (name): value
 *   Notes: text
 */

import fs from 'fs';
import path from 'path';

export interface KpiEntry { key: string; value: string; }

export interface Checkin {
  date: string;
  found: boolean;
  format: 'eod' | 'minimal' | 'unknown';
  priorities: string[];         // "First Move Tomorrow" or inline Priority N
  completed: string[];          // "Completed" section
  blocker: string;              // "Blocked / Unfinished" first item
  wins: string[];               // "Wins / Insights / Decisions" — WIN entries
  decisions: string[];          // "Wins / Insights / Decisions" — DECISION entries
  kpi: KpiEntry[];              // "Numbers / Updates" parsed as key: value
  revenueNote: string;          // "Numbers / Updates" Revenue line
  commitments: string[];        // (legacy support)
  notes: string[];              // fallback notes
}

const CHECKINS_DIR =
  process.env.CHECKINS_DIR ??
  path.join('C:', 'Users', 'broug', '.openclaw', 'workspace', 'memory', 'checkins');

export function parseCheckinContent(content: string, date: string): Checkin {
  const lines = content.split('\n');

  // Detect format
  const isEod = lines.some(l => /^##\s+\d+\./.test(l.trim()));
  const isMinimal = lines.some(l => /^Priority\s+\d+/i.test(l.trim()));

  if (isEod) return parseEod(lines, date);
  if (isMinimal) return parseMinimal(lines, date);
  return parseGeneric(lines, date);
}

// ── FORMAT A: EOD check-in ───────────────────────────────────────────────────

function parseEod(lines: string[], date: string): Checkin {
  const priorities: string[] = [];
  const completed: string[] = [];
  const blockers: string[] = [];
  const wins: string[] = [];
  const decisions: string[] = [];
  const kpi: KpiEntry[] = [];
  let revenueNote = '';
  const notes: string[] = [];

  let section = '';

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('# ')) continue;

    // Section header — e.g. "## 1. Completed" or "## 4. First Move Tomorrow"
    if (/^##\s+/.test(trimmed)) {
      section = trimmed.replace(/^##\s+\d+\.\s*/, '').toLowerCase();
      continue;
    }

    if (!trimmed.startsWith('- ') && !trimmed.startsWith('* ')) continue;
    const item = trimmed.replace(/^[-*]\s+/, '').trim();
    if (!item) continue;

    if (section.includes('completed')) {
      completed.push(item);
    } else if (section.includes('blocked') || section.includes('unfinished')) {
      blockers.push(item);
    } else if (section.includes('wins') || section.includes('insights') || section.includes('decisions')) {
      // Bold prefix: **WIN:** or **DECISION:** or **INSIGHT:**
      const winMatch = item.match(/^\*\*WIN:\*\*\s*(.+)$/i);
      const decMatch = item.match(/^\*\*DECISION:\*\*\s*(.+)$/i);
      if (winMatch) wins.push(winMatch[1].trim());
      else if (decMatch) decisions.push(decMatch[1].trim());
      else notes.push(item);
    } else if (section.includes('first move') || section.includes('tomorrow')) {
      priorities.push(item);
    } else if (section.includes('numbers') || section.includes('updates')) {
      // "**Revenue:** $500 retainer" → revenueNote
      const revMatch = item.match(/^\*\*Revenue:\*\*\s*(.+)$/i);
      if (revMatch) {
        revenueNote = revMatch[1].trim();
        kpi.push({ key: 'Revenue', value: revMatch[1].trim() });
      } else {
        // "**Network/Leads:** text" → kpi entry
        const kpiMatch = item.match(/^\*\*(.+?):\*\*\s*(.+)$/);
        if (kpiMatch) {
          kpi.push({ key: kpiMatch[1].trim(), value: kpiMatch[2].trim() });
        } else {
          notes.push(item);
        }
      }
    }
  }

  return {
    date, found: true, format: 'eod',
    priorities,
    completed,
    blocker: blockers[0] ?? '',
    wins,
    decisions,
    kpi,
    revenueNote,
    commitments: [],
    notes,
  };
}

// ── FORMAT B: Minimal (agent-generated) ─────────────────────────────────────

function parseMinimal(lines: string[], date: string): Checkin {
  const priorities: string[] = [];
  const notes: string[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // "Priority 1 (Dad Strength Visual Identity): unknown" or ": some description"
    const prioMatch = trimmed.match(/^Priority\s+\d+\s+\((.+?)\):\s*(.*)$/i);
    if (prioMatch) {
      const name = prioMatch[1].trim();
      const val = prioMatch[2].trim();
      // Only include if agent got a real value (not "unknown" / empty)
      if (val && val.toLowerCase() !== 'unknown') {
        priorities.push(`${name}: ${val}`);
      } else {
        priorities.push(name); // just the name
      }
      continue;
    }

    // "Notes: text"
    const notesMatch = trimmed.match(/^Notes:\s*(.+)$/i);
    if (notesMatch) {
      const noteText = notesMatch[1].trim();
      if (noteText.toLowerCase() !== 'no response within 10 minutes') {
        notes.push(noteText);
      }
    }
  }

  const hasRealContent = priorities.length > 0;
  return {
    date, found: hasRealContent, format: 'minimal',
    priorities,
    completed: [],
    blocker: '',
    wins: [],
    decisions: [],
    kpi: [],
    revenueNote: '',
    commitments: [],
    notes,
  };
}

// ── FORMAT C: Generic fallback ───────────────────────────────────────────────

function parseGeneric(lines: string[], date: string): Checkin {
  const priorities: string[] = [];
  const notes: string[] = [];
  let section = '';

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('# ')) continue;

    if (trimmed.startsWith('## ')) {
      section = trimmed.slice(3).toLowerCase();
      continue;
    }

    if (section.includes('priorities')) {
      const m = trimmed.match(/^\d+\.\s+(.+)$/);
      if (m) priorities.push(m[1].trim());
    } else if (section.includes('notes')) {
      if (trimmed.startsWith('- ')) notes.push(trimmed.slice(2).trim());
    }
  }

  return {
    date, found: priorities.length > 0, format: 'unknown',
    priorities, completed: [], blocker: '', wins: [], decisions: [],
    kpi: [], revenueNote: '', commitments: [], notes,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getCheckin(date: string): Checkin {
  const filePath = path.join(CHECKINS_DIR, `${date}.md`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseCheckinContent(content, date);
  } catch {
    return {
      date, found: false, format: 'unknown',
      priorities: [], completed: [], blocker: '', wins: [], decisions: [],
      kpi: [], revenueNote: '', commitments: [], notes: [],
    };
  }
}

export function getTodayCheckin(): Checkin {
  const today = new Date().toISOString().split('T')[0];
  return getCheckin(today);
}

/**
 * Returns today's check-in if found, otherwise falls back to yesterday's
 * EOD check-in — using "First Move Tomorrow" as today's priorities.
 * This way the homepage always shows actionable priorities.
 */
export function getTodayCheckinWithFallback(): { checkin: Checkin; usingFallback: boolean; fallbackDate: string } {
  const today = new Date().toISOString().split('T')[0];
  const todayCheckin = getCheckin(today);

  if (todayCheckin.found && todayCheckin.priorities.length > 0) {
    return { checkin: todayCheckin, usingFallback: false, fallbackDate: today };
  }

  // Walk back up to 3 days to find an EOD check-in with "First Move Tomorrow"
  for (let daysBack = 1; daysBack <= 3; daysBack++) {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    const dateStr = d.toISOString().split('T')[0];
    const prev = getCheckin(dateStr);
    if (prev.found && prev.format === 'eod' && prev.priorities.length > 0) {
      return { checkin: prev, usingFallback: true, fallbackDate: dateStr };
    }
  }

  // Nothing useful found — return today's (empty)
  return { checkin: todayCheckin, usingFallback: false, fallbackDate: today };
}
