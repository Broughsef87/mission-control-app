-- ============================================================
-- Mission Control — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── CLEAN SLATE (drop in reverse dependency order) ───────────
drop table if exists token_logs        cascade;
drop table if exists agent_logs        cascade;
drop table if exists agent_status      cascade;
drop table if exists daily_briefings   cascade;
drop table if exists platform_metrics  cascade;
drop table if exists content_items     cascade;
drop table if exists notifications     cascade;
drop table if exists revenue           cascade;
drop table if exists tasks             cascade;
drop table if exists clients           cascade;
drop table if exists projects          cascade;

-- ── PROJECTS ─────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  status      text not null default 'In Progress', -- 'In Progress' | 'Completed' | 'In Review' | 'Paused'
  description text,
  client      text default 'Internal',
  budget      text,
  deadline    date,
  priority    int  default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── TASKS ────────────────────────────────────────────────────
create table if not exists tasks (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references projects(id) on delete cascade,
  content     text not null,
  completed   boolean default false,
  agent       text,
  created_at  timestamptz default now()
);

-- ── REVENUE ──────────────────────────────────────────────────
create table if not exists revenue (
  id          uuid primary key default uuid_generate_v4(),
  date        date not null default current_date,
  amount      numeric(10,2) not null,
  source      text not null,
  category    text default 'agency', -- 'agency' | 'app' | 'community' | 'other'
  notes       text,
  created_at  timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  type        text default 'info',   -- 'info' | 'success' | 'warning' | 'error'
  title       text not null,
  body        text,
  source      text default 'system', -- 'github' | 'stripe' | 'agent' | 'system' | 'manual'
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── CONTENT ITEMS ────────────────────────────────────────────
create table if not exists content_items (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  channel     text not null,          -- 'YouTube' | 'Forge OS Blog' | 'X/Twitter' | 'Skool'
  status      text default 'backlog', -- 'backlog' | 'scripting' | 'production' | 'published'
  priority    text default 'Medium',  -- 'Low' | 'Medium' | 'High' | 'Critical'
  type        text default 'Video',   -- 'Video' | 'Short' | 'Article' | 'Thread'
  notes       text,
  published_at timestamptz,
  created_at  timestamptz default now()
);

-- ── CLIENTS (Agency CRM) ─────────────────────────────────────
create table if not exists clients (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  pipeline_stage  text default 'lead', -- 'lead' | 'proposal' | 'active' | 'invoiced' | 'completed'
  contract_value  numeric(10,2),
  renewal_date    date,
  contact_name    text,
  contact_email   text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── AGENT STATUS (OpenClaw) ──────────────────────────────────
create table if not exists agent_status (
  id          uuid primary key default uuid_generate_v4(),
  agent_name  text not null unique,
  status      text default 'Idle',    -- 'Working' | 'Idle' | 'Error' | 'Offline'
  location    text,
  task        text,
  last_seen   timestamptz default now(),
  metadata    jsonb
);

-- ── AGENT LOGS (OpenClaw activity feed) ─────────────────────
create table if not exists agent_logs (
  id          uuid primary key default uuid_generate_v4(),
  agent_name  text not null,
  action      text not null,
  path        text,
  model       text,
  tokens_in   int  default 0,
  tokens_out  int  default 0,
  tokens      int  default 0,
  cost        numeric(10,6) default 0,
  project_id  uuid references projects(id) on delete set null,
  created_at  timestamptz default now()
);

-- ── TOKEN LOGS (AI cost tracking) ───────────────────────────
create table if not exists token_logs (
  id          uuid primary key default uuid_generate_v4(),
  agent       text not null,
  model       text not null,
  tokens_in   int  default 0,
  tokens_out  int  default 0,
  cost_usd    numeric(10,6) default 0,
  project_id  uuid references projects(id) on delete set null,
  created_at  timestamptz default now()
);

-- ── PLATFORM METRICS (cached YouTube/Stripe/Skool data) ─────
create table if not exists platform_metrics (
  id           uuid primary key default uuid_generate_v4(),
  platform     text not null,  -- 'youtube' | 'stripe' | 'skool'
  metric_key   text not null,  -- 'subscribers' | 'mrr' | 'members' etc
  metric_value text not null,
  recorded_at  timestamptz default now()
);

-- ── DAILY BRIEFINGS ──────────────────────────────────────────
create table if not exists daily_briefings (
  id               uuid primary key default uuid_generate_v4(),
  content          text not null,
  metrics_snapshot jsonb,
  created_at       timestamptz default now()
);

-- ── UPDATED_AT TRIGGER ───────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create or replace trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
-- Enable RLS on all tables — only authenticated users can access
alter table projects        enable row level security;
alter table tasks           enable row level security;
alter table revenue         enable row level security;
alter table notifications   enable row level security;
alter table content_items   enable row level security;
alter table clients         enable row level security;
alter table agent_status    enable row level security;
alter table agent_logs      enable row level security;
alter table token_logs      enable row level security;
alter table platform_metrics enable row level security;
alter table daily_briefings enable row level security;

-- Full access for authenticated users
create policy "auth_all" on projects        for all using (auth.role() = 'authenticated');
create policy "auth_all" on tasks           for all using (auth.role() = 'authenticated');
create policy "auth_all" on revenue         for all using (auth.role() = 'authenticated');
create policy "auth_all" on notifications   for all using (auth.role() = 'authenticated');
create policy "auth_all" on content_items   for all using (auth.role() = 'authenticated');
create policy "auth_all" on clients         for all using (auth.role() = 'authenticated');
create policy "auth_all" on agent_status    for all using (auth.role() = 'authenticated');
create policy "auth_all" on agent_logs      for all using (auth.role() = 'authenticated');
create policy "auth_all" on token_logs      for all using (auth.role() = 'authenticated');
create policy "auth_all" on platform_metrics for all using (auth.role() = 'authenticated');
create policy "auth_all" on daily_briefings for all using (auth.role() = 'authenticated');

-- Service role bypass (for agents writing data server-side)
create policy "service_all" on agent_logs    for all using (auth.role() = 'service_role');
create policy "service_all" on agent_status  for all using (auth.role() = 'service_role');
create policy "service_all" on token_logs    for all using (auth.role() = 'service_role');
create policy "service_all" on notifications for all using (auth.role() = 'service_role');

-- ── SEED: Initial Projects ───────────────────────────────────
insert into projects (name, status, description, client, deadline, priority) values
  ('Dad Strength App', 'In Progress', 'Fitness app for busy dads. Nap-squeeze workout framework.', 'Internal', '2026-04-01', 3),
  ('Forge OS Website', 'Completed', 'Public-facing site for Forge OS. Deployed to Vercel.', 'Internal', '2026-03-14', 2),
  ('Client A: Automation', 'In Review', 'Full automation stack build for agency client.', 'Forge Agency', '2026-03-25', 1),
  ('YouTube Channel', 'In Progress', 'Documenting the Forge OS build and autonomous agency journey.', 'Internal', null, 2),
  ('Skool Community', 'In Progress', 'Dad Strength / Forge OS community on Skool.', 'Internal', null, 2)
on conflict do nothing;

-- ── SEED: Initial Agents ─────────────────────────────────────
insert into agent_status (agent_name, status, location, task) values
  ('Devroux', 'Working', 'Command Center', 'Coordinating sprint tasks'),
  ('Isaac',   'Working', 'Research Bay',   'Competitive landscape research'),
  ('Charles', 'Idle',    'Content Studio',  null),
  ('Max',     'Working', 'Engineering Bay', 'Debugging API integration'),
  ('Gabriel', 'Idle',    'Ready Room',      null),
  ('Ollie',   'Working', 'Content Studio',  'Drafting YouTube script'),
  ('Silas',   'Idle',    'Research Bay',    null)
on conflict (agent_name) do update set
  status = excluded.status,
  location = excluded.location,
  task = excluded.task,
  last_seen = now();

-- ── SEED: Initial Revenue ────────────────────────────────────
insert into revenue (date, amount, source, category, notes) values
  ('2026-03-10', 450.00,  'Forge Agency - Client A Retainer', 'agency', null),
  ('2026-03-12', 1200.00, 'Forge Agency - Automation Build',  'agency', null),
  ('2026-03-14', 350.00,  'Dad Strength App - Subscriptions', 'app',    null),
  ('2026-03-15', 1102.00, 'Forge Agency - Strategy Audit',    'agency', null)
on conflict do nothing;

-- ── SEED: Initial Notifications ──────────────────────────────
insert into notifications (type, title, body, source) values
  ('success', 'Deployment Successful', 'forge-os-website deployed to Vercel production', 'github'),
  ('info',    'Overnight Sprint Report', 'Agents completed 14 tasks across 3 projects during autonomous overnight run', 'agent'),
  ('info',    'Agency Pitch Deck Draft', 'Lisa submitted pitch deck draft for review', 'manual')
on conflict do nothing;

-- ── SEED: Initial Content Items ──────────────────────────────
insert into content_items (title, channel, status, priority, type) values
  ('B2B AI Agency Pivot Reveal',       'YouTube',       'backlog',    'High',     'Video'),
  ('The "Nap-Squeeze" Framework',      'YouTube',       'backlog',    'Medium',   'Short'),
  ('How I Built My Autonomous CoS',    'Forge OS Blog', 'scripting',  'High',     'Article'),
  ('Dad Strength: Day 01',             'YouTube',       'production', 'Critical', 'Video'),
  ('Forge OS Launch Post',             'X/Twitter',     'published',  'Low',      'Thread')
on conflict do nothing;

-- ── SEED: Initial Clients ────────────────────────────────────
insert into clients (name, pipeline_stage, contract_value, contact_name, notes) values
  ('Client A', 'active',   4500.00, 'TBD', 'Automation build — in review'),
  ('Lead B',   'proposal', 8000.00, 'TBD', 'Sent proposal 2026-03-18'),
  ('Lead C',   'lead',     null,    'TBD', 'Initial discovery call scheduled')
on conflict do nothing;
