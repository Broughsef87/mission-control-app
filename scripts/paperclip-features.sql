-- ══════════════════════════════════════════════════════════════
-- Paperclip-inspired features for Mission Control
-- Run in Supabase SQL editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. Per-agent monthly budget caps ─────────────────────────
alter table agent_status add column if not exists monthly_budget numeric(10,2) default null;
alter table agent_status add column if not exists budget_reset_day int default 1;

-- ── 2. Companies (multi-company isolation) ───────────────────
create table if not exists companies (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  color       text default '#E07A5F',
  created_at  timestamptz default now()
);

-- Seed default companies
insert into companies (name, slug, color) values
  ('Forge Agency',  'forge-agency',  '#E07A5F'),
  ('Dad Strength',  'dad-strength',  '#3D7A52'),
  ('Internal / OS', 'internal',      '#9A7A30')
on conflict (slug) do nothing;

-- Add company_id to projects
alter table projects add column if not exists company_id uuid references companies(id) on delete set null;

-- ── 3. Goals (goal hierarchy) ────────────────────────────────
create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  company_id  uuid references companies(id) on delete cascade,
  title       text not null,
  description text,
  status      text default 'Active',   -- Active | Achieved | Paused
  target_date date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Link projects to goals
alter table projects add column if not exists goal_id uuid references goals(id) on delete set null;

-- RLS
alter table goals enable row level security;
create policy "goals_read" on goals for select using (true);
create policy "goals_write" on goals for all using (true);

alter table companies enable row level security;
create policy "companies_read" on companies for select using (true);
create policy "companies_write" on companies for all using (true);

-- ── 4. Tickets (persistent agent task threads) ───────────────
create table if not exists tickets (
  id           uuid primary key default uuid_generate_v4(),
  agent_name   text,
  company_id   uuid references companies(id) on delete set null,
  title        text not null,
  status       text default 'open',    -- open | in_progress | resolved
  priority     text default 'normal',  -- low | normal | high
  created_at   timestamptz default now(),
  resolved_at  timestamptz
);

create table if not exists ticket_messages (
  id          uuid primary key default uuid_generate_v4(),
  ticket_id   uuid references tickets(id) on delete cascade,
  role        text not null,           -- agent | human | system
  content     text not null,
  created_at  timestamptz default now()
);

alter table tickets enable row level security;
create policy "tickets_read" on tickets for select using (true);
create policy "tickets_write" on tickets for all using (true);

alter table ticket_messages enable row level security;
create policy "ticket_messages_read" on ticket_messages for select using (true);
create policy "ticket_messages_write" on ticket_messages for all using (true);

-- ── 5. Approval gates ────────────────────────────────────────
create table if not exists pending_approvals (
  id           uuid primary key default uuid_generate_v4(),
  agent_name   text not null,
  company_id   uuid references companies(id) on delete set null,
  action_type  text not null,          -- e.g. 'send_email', 'post_content', 'trigger_payment'
  title        text not null,
  description  text,
  payload      jsonb,
  status       text default 'pending', -- pending | approved | denied
  created_at   timestamptz default now(),
  resolved_at  timestamptz,
  resolved_by  text
);

alter table pending_approvals enable row level security;
create policy "approvals_read" on pending_approvals for select using (true);
create policy "approvals_write" on pending_approvals for all using (true);
