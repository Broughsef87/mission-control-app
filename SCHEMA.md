# Mission Control — Live Supabase Schema

**Project:** qegyqvyxzvaiulshgbsh  
**URL:** https://qegyqvyxzvaiulshgbsh.supabase.co  
**Generated:** 2026-04-22  

> Source of truth. Query the live DB if in doubt — this doc was built from `pg_catalog` on the date above.

---

## Realtime-Enabled Tables

All five are in `supabase_realtime` publication:

| Table | Purpose |
|-------|---------|
| `agent_logs` | Agent action stream (62k+ rows) |
| `agent_status` | Live agent heartbeat / current state |
| `alerts` | Missed crons, system failures |
| `checkins` | Evening check-in structured data |
| `daily_briefings` | Morning brief content |

---

## Tables

### `agent_logs`
Agent action stream. Primary source for Recent Execution feed.  
RLS: enabled. Rows: ~62,974.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `agent_name` | text | |
| `action` | text | |
| `path` | text | nullable |
| `model` | text | nullable |
| `tokens_in` | int4 | default 0 |
| `tokens_out` | int4 | default 0 |
| `tokens` | int4 | default 0 |
| `cost` | numeric | default 0 |
| `project_id` | uuid | nullable, FK → projects |
| `created_at` | timestamptz | default now() |

---

### `agent_status`
Live agent presence. Code queries this table (not `agent_statuses`).  
RLS: enabled. Rows: 10. Unique on `agent_name`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `agent_name` | text | unique |
| `status` | text | default 'Idle' |
| `location` | text | nullable |
| `task` | text | nullable |
| `last_seen` | timestamptz | default now() |
| `metadata` | jsonb | nullable |
| `monthly_budget` | numeric | nullable |
| `budget_reset_day` | int4 | nullable, default 1 |

> **Note:** `agent_statuses` (plural) also exists as a legacy duplicate. Code uses `agent_status`.

---

### `alerts` *(new — 2026-04-22)*
Unresolved cron misses and system failures. Surfaces in alert banner.  
RLS: disabled. Rows: 0.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `created_at` | timestamptz | default now() |
| `severity` | text | check: 'critical' \| 'warning' \| 'info' |
| `source` | text | agent name or system |
| `message` | text | |
| `resolved` | boolean | default false |
| `resolved_at` | timestamptz | nullable |

Index: `alerts_unresolved (resolved, created_at desc)`

---

### `checkins`
Evening check-in data. Currently 0 DB rows — all historical data lives at  
`workspace/memory/checkins/YYYY-MM-DD.md`.  
RLS: enabled. Unique on `date`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `date` | date | unique |
| `priorities` | text[] | default '{}' |
| `blocker` | text | nullable |
| `numbers` | jsonb | default '{}' |
| `notes` | text | nullable |
| `content` | text | nullable, raw markdown |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `clients`
CRM client records.  
RLS: enabled. Rows: 0.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `name` | text | |
| `pipeline_stage` | text | default 'lead' |
| `contract_value` | numeric | nullable |
| `renewal_date` | date | nullable |
| `contact_name` | text | nullable |
| `contact_email` | text | nullable |
| `notes` | text | nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `companies`
Top-level company entities (Forge Agency, Dad Strength, etc.).  
RLS: enabled. Rows: 3.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `name` | text | |
| `slug` | text | unique |
| `color` | text | nullable, default '#E07A5F' |
| `created_at` | timestamptz | |

Referenced by: `goals`, `pending_approvals`, `projects`, `tickets`

---

### `content_items`
Content pipeline tracking.  
RLS: enabled. Rows: 8.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `title` | text | |
| `channel` | text | |
| `status` | text | default 'backlog' |
| `priority` | text | default 'Medium' |
| `type` | text | default 'Video' |
| `notes` | text | nullable |
| `published_at` | timestamptz | nullable |
| `created_at` | timestamptz | |

---

### `daily_briefings`
Morning brief content posted by cron.  
RLS: enabled. Rows: 2.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `content` | text | |
| `metrics_snapshot` | jsonb | nullable |
| `created_at` | timestamptz | |

> **Gap:** No `title` or `type` column. Cron spec sends `{ title, content, type }` — API route maps these: `title` and `type` go into `metrics_snapshot` as metadata, or a migration adds them. Phase 4 resolves this.

---

### `daily_logs`
Raw markdown sync from OpenClaw workspace logs.  
RLS: enabled. Rows: 47.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `log_date` | date | unique |
| `content` | text | |
| `synced_at` | timestamptz | |

---

### `goals`
Company-level goals.  
RLS: enabled. Rows: 0.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `company_id` | uuid | nullable, FK → companies |
| `title` | text | |
| `description` | text | nullable |
| `status` | text | default 'Active' |
| `target_date` | date | nullable |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `notifications`
In-app notification log.  
RLS: enabled. Rows: 27.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `type` | text | default 'info' |
| `title` | text | |
| `body` | text | nullable |
| `source` | text | default 'system' |
| `read` | boolean | default false |
| `created_at` | timestamptz | |

---

### `pending_approvals`
Items waiting on Andrew.  
RLS: enabled. Rows: 0.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `agent_name` | text | |
| `company_id` | uuid | nullable, FK → companies |
| `action_type` | text | |
| `title` | text | |
| `description` | text | nullable |
| `payload` | jsonb | nullable |
| `status` | text | default 'pending' |
| `created_at` | timestamptz | |
| `resolved_at` | timestamptz | nullable |
| `resolved_by` | text | nullable |

---

### `platform_metrics`
External platform metric snapshots (YouTube, Stripe, etc.).  
RLS: enabled. Rows: 108.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `platform` | text | |
| `metric_key` | text | |
| `metric_value` | text | |
| `recorded_at` | timestamptz | |

---

### `projects`
Active project tracking.  
RLS: enabled. Rows: 5.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `name` | text | |
| `status` | text | default 'In Progress' |
| `description` | text | nullable |
| `client` | text | nullable, default 'Internal' |
| `budget` | text | nullable |
| `deadline` | date | nullable |
| `priority` | int4 | nullable, default 1 |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `company_id` | uuid | nullable, FK → companies |
| `goal_id` | uuid | nullable, FK → goals |

---

### `tasks`
Project sub-tasks.  
RLS: enabled. Rows: 0.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `project_id` | uuid | nullable, FK → projects |
| `content` | text | |
| `completed` | boolean | default false |
| `agent` | text | nullable |
| `created_at` | timestamptz | |

---

### `tickets` / `ticket_messages`
Support/task ticket system.  
RLS: enabled. Rows: 0.

**tickets:** `id`, `agent_name`, `company_id` (FK), `title`, `status` (default 'open'), `priority` (default 'normal'), `created_at`, `resolved_at`  
**ticket_messages:** `id`, `ticket_id` (FK), `role`, `content`, `created_at`

---

### `token_logs`
Raw token usage from agent sessions.  
RLS: enabled. Rows: ~50,557.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `agent` | text | |
| `model` | text | |
| `tokens_in` | int4 | |
| `tokens_out` | int4 | |
| `cost_usd` | numeric | |
| `project_id` | uuid | nullable |
| `created_at` | timestamptz | |

---

### `token_summary`
Aggregated daily token usage per agent/model.  
RLS: enabled. Rows: 0.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto |
| `agent_name` | text | |
| `model` | text | |
| `total_tokens` | int8 | default 0 |
| `total_cost` | numeric | default 0 |
| `date` | date | default CURRENT_DATE |
| `created_at` | timestamptz | |

---

## Forge Client Portal Tables

Separate subsystem, RLS disabled. All empty.

- **`forge_clients`** — portal client records with `portal_token`
- **`forge_deliverables`** — per-client deliverables tracking
- **`forge_reports`** — per-client monthly report content

---

## Known Issues / Action Items

| Issue | Impact | Fix |
|-------|--------|-----|
| `daily_briefings` missing `title` + `type` | Cron POST payload has fields the table doesn't | Phase 4: add columns or store in `metrics_snapshot` |
| `agent_statuses` duplicate of `agent_status` | Confusion, stale data | Drop `agent_statuses` when safe |
| `checkins` has 0 rows | Homepage falls back to markdown files | Cron must POST to `/api/checkin` after each check-in |
| `agent_logs.project_id` FK undefined | Cannot link runs to projects | Wire up when projects have stable IDs |
