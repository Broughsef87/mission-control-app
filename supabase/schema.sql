-- Mission Control — Supabase Schema
-- Run this in your Supabase SQL editor to provision the cloud database.

-- Agent statuses: live status of each OpenClaw agent
create table if not exists agent_statuses (
  id           uuid primary key default gen_random_uuid(),
  agent_name   text not null,
  status       text not null default 'idle',   -- 'active' | 'idle' | 'offline'
  location     text not null default 'Ready Room',
  last_seen    timestamptz not null default now(),
  metadata     jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Unique constraint: one row per agent
create unique index if not exists agent_statuses_agent_name_idx on agent_statuses(agent_name);

-- Agent logs: every action/token event written by OpenClaw agents
create table if not exists agent_logs (
  id          uuid primary key default gen_random_uuid(),
  agent_name  text not null,
  action      text not null,
  path        text,
  model       text,
  tokens      integer,
  cost        numeric(10, 6),
  created_at  timestamptz not null default now()
);

create index if not exists agent_logs_agent_name_idx on agent_logs(agent_name);
create index if not exists agent_logs_created_at_idx  on agent_logs(created_at desc);

-- Projects: synced from local Prisma DB
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  status      text not null default 'In Progress',
  description text,
  priority    integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Token burn summary (materialized via insert trigger on agent_logs)
create table if not exists token_summary (
  id           uuid primary key default gen_random_uuid(),
  agent_name   text not null,
  model        text not null,
  total_tokens bigint not null default 0,
  total_cost   numeric(12, 6) not null default 0,
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);

create unique index if not exists token_summary_agent_model_date on token_summary(agent_name, model, date);

-- Enable Row Level Security (all reads public for the dashboard)
alter table agent_statuses  enable row level security;
alter table agent_logs       enable row level security;
alter table projects         enable row level security;
alter table token_summary    enable row level security;

create policy "Public read access" on agent_statuses  for select using (true);
create policy "Public read access" on agent_logs       for select using (true);
create policy "Public read access" on projects         for select using (true);
create policy "Public read access" on token_summary    for select using (true);

-- Service-role insert (agents write via service key, not anon key)
create policy "Service insert"     on agent_statuses  for insert with check (true);
create policy "Service insert"     on agent_logs       for insert with check (true);
create policy "Service upsert"     on agent_statuses  for update using (true);

-- Seed with default agent rows so the dashboard shows names immediately
insert into agent_statuses (agent_name, status, location)
values
  ('Devroux', 'idle',   'Command Center'),
  ('Isaac',   'idle',   'Engineering Bay'),
  ('Charles', 'idle',   'Content Studio'),
  ('Max',     'idle',   'Ready Room'),
  ('Gabriel', 'idle',   'Ready Room'),
  ('Ollie',   'idle',   'Ready Room')
on conflict (agent_name) do nothing;
