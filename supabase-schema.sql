-- ============================================================
-- Pollution Control Portal — Supabase schema (hardened)
-- ============================================================

create extension if not exists pgcrypto;

-- Private helper schema for security-definer functions (not exposed via API)
create schema if not exists private;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('citizen', 'official')),
  area text,
  employee_id text,
  designation text,
  department text,
  wards text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Helper: is the current user an official? (security definer avoids RLS recursion on profiles)
create or replace function private.is_official()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'official'
  );
$$;

revoke execute on function private.is_official() from public, anon;
grant execute on function private.is_official() to authenticated;

create policy "Users can view their own profile"
  on profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Officials can view every profile"
  on profiles for select
  to authenticated
  using ( private.is_official() );

create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id );

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- ------------------------------------------------------------
-- COMPLAINTS
-- ------------------------------------------------------------
create table complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_code text unique not null default (
    'PC-2026-' || lpad(floor(random() * 99999)::text, 5, '0')
  ),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  category text not null,
  description text not null,
  location text not null,
  priority text not null default 'Medium',
  status text not null default 'Submitted',
  department text not null default 'Unassigned',
  evidence_url text,
  created_at timestamptz default now()
);

create index complaints_user_id_idx on complaints (user_id);

alter table complaints enable row level security;

create policy "Citizens can view their own complaints"
  on complaints for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Officials can view all complaints"
  on complaints for select
  to authenticated
  using ( private.is_official() );

create policy "Citizens can insert their own complaints"
  on complaints for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Officials can update any complaint"
  on complaints for update
  to authenticated
  using ( private.is_official() )
  with check ( private.is_official() );

-- ------------------------------------------------------------
-- COMPLAINT TIMELINE
-- ------------------------------------------------------------
create table complaint_timeline (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  status text not null,
  note text,
  department text,
  created_at timestamptz default now()
);

create index complaint_timeline_complaint_id_idx on complaint_timeline (complaint_id);

alter table complaint_timeline enable row level security;

create policy "Visible to the complaint's owner or any official"
  on complaint_timeline for select
  to authenticated
  using (
    private.is_official()
    or exists (
      select 1 from complaints c
      where c.id = complaint_timeline.complaint_id
      and c.user_id = (select auth.uid())
    )
  );

create policy "Citizens can log the initial submission entry"
  on complaint_timeline for insert
  to authenticated
  with check (
    exists (
      select 1 from complaints c
      where c.id = complaint_id and c.user_id = (select auth.uid())
    )
  );

create policy "Officials can add timeline entries"
  on complaint_timeline for insert
  to authenticated
  with check ( private.is_official() );

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  complaint_id uuid references complaints(id) on delete cascade,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create index notifications_user_id_idx on notifications (user_id);

alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can mark their own notifications read"
  on notifications for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Officials can create notifications for citizens"
  on notifications for insert
  to authenticated
  with check ( private.is_official() );

-- ------------------------------------------------------------
-- STORAGE  (evidence photo/video uploads)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;

create policy "Anyone signed in can upload evidence"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'evidence' );

create policy "Evidence is publicly viewable"
  on storage.objects for select
  to public
  using ( bucket_id = 'evidence' );
