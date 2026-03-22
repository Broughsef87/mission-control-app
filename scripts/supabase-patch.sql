-- ============================================================
-- Mission Control — Supabase Patch
-- Run this if the main migration had errors.
-- It forces a clean reset of just the tables that failed.
-- ============================================================

-- Force drop and recreate projects table cleanly
drop table if exists tasks       cascade;
drop table if exists projects    cascade;

create table projects (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  status      text not null default 'In Progress',
  description text,
  client      text default 'Internal',
  budget      text,
  deadline    date,
  priority    int  default 1,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table tasks (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references projects(id) on delete cascade,
  content     text not null,
  completed   boolean default false,
  agent       text,
  created_at  timestamptz default now()
);

alter table projects enable row level security;
alter table tasks    enable row level security;

drop policy if exists "auth_all" on projects;
drop policy if exists "auth_all" on tasks;

create policy "auth_all" on projects for all using (auth.role() = 'authenticated');
create policy "auth_all" on tasks    for all using (auth.role() = 'authenticated');

-- Also allow service role (API routes)
drop policy if exists "service_all" on projects;
drop policy if exists "service_all" on tasks;

create policy "service_all" on projects for all using (auth.role() = 'service_role');
create policy "service_all" on tasks    for all using (auth.role() = 'service_role');

-- Trigger to auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_updated_at on projects;
create trigger set_updated_at before update on projects
  for each row execute function update_updated_at();

-- Seed projects
insert into projects (name, status, description, client, deadline, priority) values
  ('Dad Strength App',    'In Progress', 'Fitness app for busy dads. Nap-squeeze workout framework.', 'Internal',      '2026-04-01', 3),
  ('Forge OS Website',    'Completed',   'Public-facing site for Forge OS. Deployed to Vercel.',       'Internal',      '2026-03-14', 2),
  ('Client A: Automation','In Review',   'Full automation stack build for agency client.',              'Forge Agency',  '2026-03-25', 1),
  ('YouTube Channel',     'In Progress', 'Documenting the Forge OS build and autonomous agency.',       'Internal',      null,         2),
  ('Skool Community',     'In Progress', 'Dad Strength / Forge OS community on Skool.',                'Internal',      null,         2)
on conflict do nothing;

-- Also patch all other RLS policies to allow service_role
-- (run these only if the original migration already created these tables)
do $$ begin
  if exists (select 1 from information_schema.tables where table_name = 'revenue') then
    execute 'drop policy if exists "service_all" on revenue';
    execute 'create policy "service_all" on revenue for all using (auth.role() = ''service_role'')';
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'notifications') then
    execute 'drop policy if exists "service_all" on notifications';
    execute 'create policy "service_all" on notifications for all using (auth.role() = ''service_role'')';
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'content_items') then
    execute 'drop policy if exists "service_all" on content_items';
    execute 'create policy "service_all" on content_items for all using (auth.role() = ''service_role'')';
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'clients') then
    execute 'drop policy if exists "service_all" on clients';
    execute 'create policy "service_all" on clients for all using (auth.role() = ''service_role'')';
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'platform_metrics') then
    execute 'drop policy if exists "service_all" on platform_metrics';
    execute 'create policy "service_all" on platform_metrics for all using (auth.role() = ''service_role'')';
  end if;
  if exists (select 1 from information_schema.tables where table_name = 'daily_briefings') then
    execute 'drop policy if exists "service_all" on daily_briefings';
    execute 'create policy "service_all" on daily_briefings for all using (auth.role() = ''service_role'')';
  end if;
end $$;
