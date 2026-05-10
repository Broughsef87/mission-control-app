# Mission Control — Build Spec v3.0
**Owner:** Andrew  
**Builders:** Claude Code/Archon (all implementation), Antigravity (cron integration), Devroux (verification + agent ops)  
**Updated:** 2026-04-22 — design system added, ownership corrected  
**Audit by:** Devroux (read-only, no files touched)  
**Design system:** Andrew Brough / Forge OS — extracted from `andrew-brough-design-system` bundle

---

## Audit Summary

The existing codebase is buildable but not clean. Supabase is already the real data layer. Several things we planned to build already exist:

| What we planned | What actually exists |
|----------------|---------------------|
| `agent_logs` table | ✅ Already in Supabase, `LiveAgentFeed` already subscribes to it |
| Morning brief storage | ✅ `daily_briefings` table exists |
| Evening check-in storage | ✅ `checkins` table exists |
| Supabase Realtime | ✅ Already wired in `LiveAgentFeed` |
| KPI strip | ✅ Partially real — Revenue MTD from DB, others from checkin data |
| `MorningBriefing` component | ✅ Exists |
| Agent activity page | ✅ `/agents` page + `AgentVitals`, `AgentHeatmap` components exist |

**What's missing or broken:**
- No `alerts` table or alert surfacing
- No unified event feed (briefs, check-ins, agent actions in one timeline)
- Crons do not post to Mission Control — they operate independently
- Prisma schema is stale and conflicts with the active Supabase setup
- Login page hardcodes Supabase URL
- `projects` API falls back to JSON file — muddy source of truth
- `office` page response shapes are out of sync
- App runs on Vercel — needs to move to local PM2

---

## Architecture (Revised)

Same core approach, but we reuse existing tables where possible:

```
┌─────────────────────────────────────┐
│         OpenClaw Cron Skills        │
│  morning-brief · evening-checkin    │
│  weekly-review                      │
└──────────────┬──────────────────────┘
               │ POST to Mission Control API
               ▼
┌─────────────────────────────────────┐
│     Mission Control API (local)     │
│  /api/briefing  → daily_briefings   │
│  /api/checkin   → checkins          │
│  /api/agents/log → agent_logs       │
│  /api/alerts    → alerts (NEW)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│            Supabase                 │
│  daily_briefings · checkins         │
│  agent_logs · alerts (new)          │
│  + Realtime subscriptions           │
└──────────────┬──────────────────────┘
               │ Realtime
               ▼
┌─────────────────────────────────────┐
│      Mission Control UI (local)     │
│      http://localhost:3000          │
│  Unified feed · KPI strip           │
│  Agent activity · Alert banner      │
└─────────────────────────────────────┘
```

---

## Database Changes (Supabase)

Only one new table needed. Everything else already exists.

### NEW: `alerts`
```sql
create table alerts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  severity    text not null,        -- 'critical' | 'warning' | 'info'
  source      text not null,        -- agent name or system
  message     text not null,
  resolved    boolean default false,
  resolved_at timestamptz
);
```

### Existing tables to reuse (no schema changes needed)
- `daily_briefings` — morning briefs write here
- `checkins` — evening check-ins write here  
- `agent_logs` — agent actions write here (already happening partially)

---

## What Each Builder Does

---

## CLAUDE CODE / ARCHON — All Implementation

### Phase 1: Cleanup (do this first, before any feature work)

1. **Remove Prisma** — delete `prisma/` directory, remove `@prisma/client` and `prisma` from `package.json`. It's stale, SQLite-pointed, and doesn't match the Supabase schema. Bury it with dignity.

2. **Fix login hardcode** — `login/page.tsx` has a hardcoded Supabase URL. Replace with `process.env.NEXT_PUBLIC_SUPABASE_URL`.

3. **Remove fallback JSON** — `api/projects` falls back to `projects.json` on DB failure. Remove the fallback. If the DB is empty, return an empty array and let the UI handle it.

4. **Add `.gitignore` entries** — `.next/`, `dist/`, and `node_modules/` are in the repo tree. Add them to `.gitignore` and clean them out.

5. **Normalize env usage** — audit all files for any other hardcoded values. Everything should come from env. Document all required env vars in a `README.md` that's actually useful (replace the Next.js boilerplate).

6. **Identify ornamental pages** — `/org` and `/settings` are mostly static/placeholder. Add a visible `[WIP]` badge in the UI so they're not mistaken for functional pages. Don't delete them yet.

### Phase 2: Local Migration

1. **Install PM2** — `npm install -g pm2`
2. **Create `ecosystem.config.js`** at project root:
```js
module.exports = {
  apps: [{
    name: 'mission-control',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/mission-control',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
}
```
3. **Build and start** — `npm run build && pm2 start ecosystem.config.js`
4. **Save and set startup** — `pm2 save && pm2 startup`
5. **Remove Vercel config** — delete `.vercel/` directory. Mission Control is local now.
6. **Test cold boot** — restart machine, confirm Mission Control is live at `localhost:3000` within 60 seconds.

### Phase 3: New API Routes

Two new routes needed. The rest already exist and can be reused.

**`/api/alerts` (POST)**
```typescript
// POST body: { severity, source, message }
// Writes to alerts table in Supabase
// Returns: { id, created_at }
```

**`/api/alerts/[id]/resolve` (PATCH)**
```typescript
// Sets resolved = true, resolved_at = now()
```

The existing `/api/briefing` and `/api/checkin` routes already accept data — verify they accept the payload shape the cron skills will send (see Antigravity brief below for exact shapes) and adjust if needed.

### Phase 4: UI — Unified Feed + Alert Banner

The dashboard (`/`) needs two additions:

1. **Alert Banner** — renders at the top of the page when `alerts` table has unresolved rows. Severity-colored (red = critical, yellow = warning, blue = info). Dismissible per-alert. Subscribes to `alerts` via Supabase Realtime.

2. **Unified Feed** — a scrollable timeline that combines:
   - `daily_briefings` (type: morning brief)
   - `checkins` (type: evening check-in)
   - Weekly review entries (type: weekly review)
   
   Each card shows: type badge, timestamp, title, collapsible content. Business tag (Dad Strength / Forge Agency / All) with filter toggle. Most recent first. Subscribes via Supabase Realtime so it updates live when a cron fires.

   `LiveAgentFeed` and `MorningBriefing` already exist — wire them into the feed rather than rebuilding. The unified feed can be a new `EventFeed` component that queries all three sources and merges/sorts by `created_at`.

3. **Two-pane layout** — left: EventFeed (60%). Right: LiveAgentFeed + agent activity (40%). KPI strip stays at top. Alert banner above KPI strip.

---

## ANTIGRAVITY — Cron Integration

Your job is to make the three cron skills post their output to Mission Control after each run. Mission Control then handles display — you just need to deliver the data.

### What to POST and where

**After `morning-brief` runs:**
```bash
curl -s -X POST http://localhost:3000/api/briefing \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Morning Brief — $(date +%Y-%m-%d)\",
    \"content\": \"$BRIEF_CONTENT\",
    \"type\": \"morning_brief\"
  }"
```

**After `evening-checkin` runs:**
```bash
curl -s -X POST http://localhost:3000/api/checkin \
  -H "Content-Type: application/json" \
  -d "{
    \"date\": \"$(date +%Y-%m-%d)\",
    \"notes\": \"$CHECKIN_CONTENT\",
    \"source\": \"cron\"
  }"
```

**After `weekly-review` runs:**
```bash
curl -s -X POST http://localhost:3000/api/briefing \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Weekly Review — Week of $(date +%Y-%m-%d)\",
    \"content\": \"$REVIEW_CONTENT\",
    \"type\": \"weekly_review\"
  }"
```

**After any agent task completes:**
```bash
curl -s -X POST http://localhost:3000/api/activity \
  -H "Content-Type: application/json" \
  -d "{
    \"agent\": \"antigravity\",
    \"task\": \"$TASK_NAME\",
    \"outcome\": \"success\",
    \"summary\": \"$SUMMARY\"
  }"
```

### Failure protocol — POST alert before Discord

If a cron misses its window or fails:
```bash
curl -s -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d "{
    \"severity\": \"critical\",
    \"source\": \"antigravity\",
    \"message\": \"[job-name] missed [expected-time] window. Last successful run: [timestamp].\"
  }"
```
Then post to Discord as normal. Mission Control gets it first.

### Verification

After updating all three skills, trigger each one manually and confirm:
1. The entry appears in the Mission Control feed at `localhost:3000`
2. `agent_logs` shows the activity in the right pane
3. No errors in the curl responses

---

## ANTIGRAVITY — Cron-to-Mission Control Integration

Only task for Antigravity. No code writing — just updating the cron skills to POST to the API endpoints Claude Code builds.

---

## DEVROUX — Verification Only

After Claude Code completes each phase, Devroux verifies:
- App boots at `localhost:3000`
- Feed populates when a cron fires
- Alert banner appears when a cron misses
- PM2 survives a machine restart

Devroux does not write code. If something is broken, report it back to Claude Code with specifics.

---

## CLAUDE CODE — Supabase Schema + Scaffolding

Smallest discrete task. Two items:

### 1. Run the `alerts` table migration

Connect to the existing Supabase project and run:
```sql
create table alerts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  severity    text not null check (severity in ('critical', 'warning', 'info')),
  source      text not null,
  message     text not null,
  resolved    boolean default false,
  resolved_at timestamptz
);

-- Index for fast unresolved alert queries
create index alerts_unresolved on alerts (resolved, created_at desc);

-- Enable Realtime on alerts table
alter publication supabase_realtime add table alerts;
```

### 2. Verify existing tables have Realtime enabled

Confirm these tables are in the `supabase_realtime` publication (Devroux's UI depends on it):
- `agent_logs`
- `agent_status`
- `daily_briefings`
- `checkins`

If any are missing, add them:
```sql
alter publication supabase_realtime add table [table_name];
```

### 3. Document the actual schema

Query the live Supabase schema and produce a `SCHEMA.md` file in the repo root that lists all tables, columns, and types as they actually exist. The README is useless right now and there's no schema doc. This becomes the source of truth going forward.

---

---

## CLAUDE CODE / ARCHON — Phase 5: Design System Implementation

Do this pass after Phase 4 (UI core) is working. This is a full aesthetic overhaul using the Andrew Brough / Forge OS design system. The goal: Mission Control should look and feel like a live ops dashboard from the same visual world as `andrew-brough.vercel.app`.

### Source files
The full design system is in `workspace/knowledge/70-systems/` — but all the tokens you need are below. Do not invent or deviate.

---

### Step 1 — Replace `globals.css` tokens

Add these CSS variables to the `:root` block in `src/app/globals.css`. They are the source of truth for the entire overhaul. Keep any existing Tailwind utilities; just add/replace the token layer.

```css
:root {
  /* SURFACES */
  --ab-base:          #05070C;
  --ab-surface:       #0A0D14;
  --ab-surface-2:     #0F1520;
  --ab-border:        #1A2130;
  --ab-border-bright: #2A3545;

  /* SIGNAL COLORS */
  --ab-red:         #DC2626;
  --ab-red-dim:     rgba(220,38,38,0.12);
  --ab-red-glow:    rgba(220,38,38,0.25);
  --ab-red-hover:   #B91C1C;
  --ab-gold:        #E8A320;
  --ab-gold-dim:    rgba(232,163,32,0.15);
  --ab-green:       #28CD41;
  --ab-blue:        #1E6FFF;

  /* TEXT */
  --ab-text:      #EAEAEA;
  --ab-body-text: #B8C0CC;
  --ab-muted:     #6A7888;

  /* FONTS */
  --ab-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --ab-font-mono: 'Courier New', 'Courier', ui-monospace, monospace;

  /* RADII */
  --ab-radius-xs: 2px;
  --ab-radius-sm: 0.125rem;
  --ab-radius-md: 0.375rem;
  --ab-radius-lg: 0.5rem;

  /* SHADOWS */
  --ab-glow-red:    0 0 32px rgba(220,38,38,0.25), 0 4px 16px rgba(220,38,38,0.2);
  --ab-glow-gold:   0 0 40px rgba(232,163,32,0.10), 0 8px 32px rgba(0,0,0,0.4);
  --ab-shadow-card: 0 0 40px rgba(232,163,32,0.06), 0 8px 32px rgba(0,0,0,0.4);

  /* ANIMATION */
  --ab-ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ab-ease-quick:  cubic-bezier(0.25, 0.1, 0.25, 1);
}

html, body {
  background: var(--ab-base);
  color: var(--ab-text);
  font-family: var(--ab-font-sans);
  -webkit-font-smoothing: antialiased;
}
```

---

### Step 2 — Update `tailwind.config.ts`

Extend the Tailwind theme to map the design tokens so utility classes work throughout the app:

```typescript
theme: {
  extend: {
    colors: {
      'ab-base':         '#05070C',
      'ab-surface':      '#0A0D14',
      'ab-surface-2':    '#0F1520',
      'ab-border':       '#1A2130',
      'ab-border-bright':'#2A3545',
      'ab-red':          '#DC2626',
      'ab-red-hover':    '#B91C1C',
      'ab-gold':         '#E8A320',
      'ab-green':        '#28CD41',
      'ab-blue':         '#1E6FFF',
      'ab-text':         '#EAEAEA',
      'ab-body':         '#B8C0CC',
      'ab-muted':        '#6A7888',
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['Courier New', 'Courier', 'ui-monospace', 'monospace'],
    },
    borderRadius: {
      'xs': '2px',
      'sm': '0.125rem',
      'md': '0.375rem',
      'lg': '0.5rem',
    },
  },
},
```

---

### Step 3 — Ambient background layers

Add these three fixed layers to the root layout (`src/app/layout.tsx`), inside `<body>` before `{children}`. They sit behind everything at z-index 0/1.

```tsx
{/* Amber grid — 2.5% opacity, fades from top */}
<div className="fixed inset-0 pointer-events-none" style={{
  backgroundImage: 'linear-gradient(rgba(232,163,32,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,163,32,0.025) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
  maskImage: 'radial-gradient(ellipse at top, #000 0%, transparent 70%)',
  zIndex: 0,
}} />

{/* CRT scan lines */}
<div className="fixed inset-0 pointer-events-none" style={{
  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
  zIndex: 1,
}} />

{/* Red spotlight above hero */}
<div className="fixed pointer-events-none" style={{
  top: '-200px', left: '50%', transform: 'translateX(-50%)',
  width: '900px', height: '600px',
  background: 'radial-gradient(ellipse, rgba(220,38,38,0.06) 0%, transparent 60%)',
  zIndex: 1,
}} />
```

---

### Step 4 — Side rails

Add fixed vertical rails to `layout.tsx`. They carry mono labels and are the most distinctive brand element. Hide on mobile (< 900px).

```tsx
{/* Left rail */}
<div className="fixed top-0 bottom-0 left-0 w-8 hidden lg:flex flex-col items-center justify-center gap-3 pointer-events-none z-50 border-r border-ab-border">
  <div className="flex-1 w-px bg-gradient-to-b from-transparent via-ab-border to-transparent" />
  <div className="w-1 h-1 rounded-full bg-ab-border-bright" />
  <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ab-muted" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>FORGE-OS · 2026</span>
  <div className="w-1 h-1 rounded-full bg-ab-border-bright" />
  <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ab-muted" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>BUILD IN PUBLIC</span>
  <div className="w-1 h-1 rounded-full bg-ab-border-bright" />
  <div className="flex-1 w-px bg-gradient-to-b from-transparent via-ab-border to-transparent" />
</div>

{/* Right rail */}
<div className="fixed top-0 bottom-0 right-0 w-8 hidden lg:flex flex-col items-center justify-center gap-3 pointer-events-none z-50 border-l border-ab-border">
  <div className="flex-1 w-px bg-gradient-to-b from-transparent via-ab-border to-transparent" />
  <div className="w-1 h-1 rounded-full bg-ab-border-bright" />
  <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ab-muted" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>MISSION CONTROL</span>
  <div className="w-1 h-1 rounded-full bg-ab-border-bright" />
  <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ab-muted" style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>v2.0 · OPENCLAW</span>
  <div className="w-1 h-1 rounded-full bg-ab-border-bright" />
  <div className="flex-1 w-px bg-gradient-to-b from-transparent via-ab-border to-transparent" />
</div>
```

---

### Step 5 — Nav overhaul

Replace the existing nav with this pattern (keep existing routing logic, swap the visual shell):

```tsx
<nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-10 py-4 border-b border-ab-border"
  style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'rgba(5,7,12,0.9)'}}>
  
  {/* Brand */}
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 border border-ab-red rounded-[3px] flex items-center justify-center text-xs font-black text-ab-red tracking-tight"
      style={{boxShadow: '0 0 10px rgba(220,38,38,0.25)'}}>AB</div>
    <div className="w-px h-4 bg-ab-border" />
    <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-ab-muted">MISSION CONTROL</span>
  </div>

  {/* Status */}
  <div className="flex items-center gap-2">
    <div className="w-1.5 h-1.5 rounded-full bg-ab-green" style={{boxShadow: '0 0 6px #28CD41', animation: 'pulse-glow 2.5s ease-in-out infinite'}} />
    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ab-muted">SYS: ONLINE</span>
  </div>
</nav>
```

---

### Step 6 — Telemetry ticker

Add a live scrolling ticker below the nav (top: 57px). This pulls from real data (agents running, cron status) but degrades gracefully with static fallback.

```tsx
<div className="fixed left-0 right-0 z-[99] h-7 overflow-hidden border-b border-ab-border flex items-center"
  style={{top: '57px', background: 'rgba(5,7,12,0.95)'}}>
  <div className="flex gap-16 whitespace-nowrap font-mono text-[10px] tracking-[0.12em] text-ab-muted pl-16"
    style={{animation: 'ticker 28s linear infinite'}}>
    {/* Duplicate content for seamless loop */}
    {[0,1].map(i => (
      <span key={i} className="flex gap-16">
        <span className="text-ab-red">SYS: ONLINE</span>
        <span>FORGE AGENCY — ACTIVE</span>
        <span>DAD STRENGTH — ACTIVE</span>
        <span className="text-ab-red">AGENTS: {agentCount} RUNNING</span>
        <span>MORNING BRIEF — {lastBriefTime}</span>
        <span>OPENCLAW · COLORADO, USA</span>
      </span>
    ))}
  </div>
</div>
```

Add keyframe to globals.css:
```css
@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes fadeUp { to { opacity: 1; transform: none; } }
@keyframes status-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(40,205,65,0.4); }
  100% { box-shadow: 0 0 0 6px rgba(40,205,65,0); }
}
```

---

### Step 7 — Card system

Replace all card elements site-wide with the `.forge-card` pattern. Three accent variants:
- **Red** (`card-accent-red`) — Forge Agency content
- **Green** (`card-accent-green`) — Dad Strength content  
- **Gold** (`card-accent-gold`) — system/OpenClaw content

```css
/* Add to globals.css */
.forge-card {
  background: var(--ab-surface);
  border: 1px solid var(--ab-border);
  border-radius: var(--ab-radius-lg);
  padding: 2rem;
  position: relative; overflow: hidden;
  transition: all 0.3s ease;
}
.forge-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(220,38,38,0.5), transparent);
  opacity: 0; transition: opacity 0.3s ease;
}
.forge-card::after {
  content: ''; position: absolute; bottom: 0; right: 0; width: 40px; height: 40px;
  border-bottom: 1px solid var(--ab-border-bright);
  border-right: 1px solid var(--ab-border-bright);
  border-bottom-right-radius: var(--ab-radius-lg);
  transition: border-color 0.3s ease;
}
.forge-card:hover { transform: translateY(-2px); box-shadow: var(--ab-shadow-card); }
.forge-card:hover::before { opacity: 1; }
.card-accent-red:hover   { border-color: rgba(220,38,38,0.3); }
.card-accent-red:hover::before   { background: linear-gradient(90deg, transparent, rgba(220,38,38,0.6), transparent); }
.card-accent-red:hover::after    { border-color: rgba(220,38,38,0.4); }
.card-accent-green:hover { border-color: rgba(40,205,65,0.3); }
.card-accent-green:hover::before { background: linear-gradient(90deg, transparent, rgba(40,205,65,0.6), transparent); }
.card-accent-green:hover::after  { border-color: rgba(40,205,65,0.4); }
.card-accent-gold:hover  { border-color: rgba(232,163,32,0.3); }
.card-accent-gold:hover::before  { background: linear-gradient(90deg, transparent, rgba(232,163,32,0.6), transparent); }
.card-accent-gold:hover::after   { border-color: rgba(232,163,32,0.4); }
```

---

### Step 8 — Artifact panels (feed items + agent log)

Every event in the feed and every agent activity row uses the `.artifact-panel` pattern — a two-part card with a dark header and mono body. This is the primary display unit for briefs, check-ins, and agent logs.

```css
.artifact-panel { background: var(--ab-surface); border: 1px solid var(--ab-border); border-radius: var(--ab-radius-lg); overflow: hidden; }
.artifact-header {
  background: var(--ab-surface-2); border-bottom: 1px solid var(--ab-border);
  padding: 10px 14px; display: flex; align-items: center; gap: 8px;
  font-family: var(--ab-font-mono); font-size: 10px;
  color: var(--ab-muted); letter-spacing: 0.08em;
}
.artifact-body { padding: 14px 16px; font-family: var(--ab-font-mono); font-size: 12px; line-height: 1.9; }
```

---

### Step 9 — Chips, status dots, overlines

```css
/* Section overline — "01 / LIVE FEED" style */
.ab-overline {
  font-family: var(--ab-font-mono); font-size: 11px;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ab-red);
  display: inline-flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;
}
.ab-overline::before { content: ''; width: 24px; height: 1px; background: var(--ab-red); display: inline-block; }

/* Chips */
.chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--ab-font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; padding: 5px 10px; border-radius: 2px; border: 1px solid; }
.chip-live  { color: var(--ab-green); background: rgba(40,205,65,0.08);   border-color: rgba(40,205,65,0.25); }
.chip-build { color: var(--ab-red);   background: rgba(220,38,38,0.08);   border-color: rgba(220,38,38,0.25); }
.chip-auto  { color: var(--ab-gold);  background: rgba(232,163,32,0.06);  border-color: rgba(232,163,32,0.25); }
.chip-sched { color: var(--ab-blue);  background: rgba(30,111,255,0.08);  border-color: rgba(30,111,255,0.25); }

/* Status dots */
.dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot-red   { background: var(--ab-red);   box-shadow: 0 0 8px var(--ab-red); }
.dot-green { background: var(--ab-green); box-shadow: 0 0 6px var(--ab-green); animation: pulse-glow 2.5s ease-in-out infinite; }
.dot-gold  { background: var(--ab-gold);  box-shadow: 0 0 6px var(--ab-gold); }
```

---

### Step 10 — Alert banner styling

The alert banner (for missed crons / system failures) uses red signal treatment:

```tsx
// Critical alert
<div className="border border-ab-red/30 rounded-md p-4 flex items-start gap-3"
  style={{background: 'rgba(220,38,38,0.08)'}}>
  <div className="dot dot-red mt-0.5 flex-shrink-0" />
  <div>
    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-ab-red">SYSTEM ALERT</span>
    <p className="text-sm text-ab-body-text mt-1">{alert.message}</p>
  </div>
  <button className="ml-auto font-mono text-[10px] text-ab-muted hover:text-ab-text">DISMISS</button>
</div>
```

---

### Step 11 — Buttons

```css
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: var(--ab-red); color: var(--ab-text);
  font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  border: none; border-radius: var(--ab-radius-sm); cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary:hover { background: var(--ab-red-hover); box-shadow: var(--ab-glow-red); transform: translateY(-1px); }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  background: transparent; color: var(--ab-text);
  font-weight: 600; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  border: 1px solid var(--ab-border-bright); border-radius: var(--ab-radius-sm);
  cursor: pointer; transition: all 0.2s ease;
}
.btn-ghost:hover { border-color: var(--ab-gold); color: var(--ab-gold); box-shadow: inset 0 0 16px rgba(232,163,32,0.06), 0 0 12px rgba(232,163,32,0.08); }
```

---

### Step 12 — Icons

Install `lucide-react` if not already present (`npm install lucide-react`). Use these specific icons per context:

| Context | Icon |
|---------|------|
| Forge Agency items | `Zap` |
| Dad Strength items | `Dumbbell` |
| OpenClaw / system | `Satellite` |
| Morning brief | `Sun` |
| Evening check-in | `Moon` |
| Weekly review | `BarChart2` |
| Agent activity | `Activity` |
| Terminal/artifact | `Terminal` |
| Alert | `AlertTriangle` |
| Success/live | `CheckCircle` |

Always: `currentColor`, stroke `1.5`, size 16px inline / 20px standalone.

---

### Design rules — do not break these

- **Background is always `#05070C`** — not black, not gray, not dark-gray. This specific hex.
- **No purple, blue, or SaaS gradients.** Red, gold, green only as accent colors.
- **No pill-shaped elements.** Max radius is `0.5rem`. Buttons are nearly square-cornered (`0.125rem`).
- **Mono font for all chrome copy** — overlines, labels, chips, ticker, side rails, agent names, timestamps, status text.
- **Inter for all content copy** — headings, body text, feed content.
- **The corner bracket (`::after`)** on every `.forge-card` is non-negotiable. It's the brand's signature.
- **No drop shadows that aren't colored.** Shadows are always keyed to red, gold, or green signal colors.
- **Transitions are 0.2–0.3s max.** No bounce, no spring, no page transitions.

---

## Build Order

1. **Claude Code** — Supabase `alerts` table + Realtime verification + `SCHEMA.md`
2. **Claude Code** — Cleanup pass (Prisma removal, login hardcode, fallback JSON, .gitignore)
3. **Claude Code** — Local migration setup, PM2 config, cold boot test
4. **Claude Code** — New API routes (`/api/alerts`, `/api/alerts/[id]/resolve`), verify existing routes match cron payload shapes
5. **Claude Code** — Alert banner + unified EventFeed + two-pane layout
6. **Antigravity** — Update three cron skills to POST to Mission Control API, test manually
7. **Devroux** — Verify end-to-end: cron fires → feed updates → agent log shows → alert fires on miss
8. **Claude Code** — Design system overhaul (Phases 5 Steps 1–12)

Do not skip the cleanup pass. Building features on top of the Prisma drift and hardcoded values will cause problems.

---

## Success Criteria

1. Andrew opens `http://localhost:3000` every morning and the last evening check-in and current morning brief are in the feed — no Discord, no files
2. All three crons post to Mission Control automatically after firing
3. A missed cron shows as a red alert banner at the top
4. Agent activity updates live in the right pane
5. App starts automatically on machine boot via PM2
6. No Vercel dependency for this app
